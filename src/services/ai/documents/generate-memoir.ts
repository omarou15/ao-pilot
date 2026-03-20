import { chatCompletion } from "@/lib/mistral";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { SYSTEM_MEMOIR } from "@/lib/prompts/documents";
import type { MemoireSection } from "@/lib/types";

const MAX_CONTENT_LENGTH = 30_000;

interface ParsedMemoirSection {
  title: string;
  content: string;
}

/**
 * Generate a structured technical memoir (memoire technique) for a project.
 * Fetches CCTP + RC + company info, calls Mistral AI, inserts into memoire_sections.
 */
export async function generateMemoir(projectId: string): Promise<MemoireSection[]> {
  const supabase = getServiceClient();

  // Fetch project metadata
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, company_id, name, reference, metadata")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Fetch CCTP and RC files in parallel
  const [cctpResult, rcResult, companyResult] = await Promise.all([
    supabase
      .from("project_files")
      .select("file_name, parsed_content")
      .eq("project_id", projectId)
      .eq("file_type", "cctp"),
    supabase
      .from("project_files")
      .select("file_name, parsed_content")
      .eq("project_id", projectId)
      .eq("file_type", "rc"),
    supabase
      .from("companies")
      .select("id, name, siret, address")
      .eq("id", project.company_id)
      .single(),
  ]);

  // Build CCTP text
  let cctpText = "";
  if (cctpResult.data && cctpResult.data.length > 0) {
    for (const file of cctpResult.data) {
      const text = extractText(file.parsed_content);
      if (text) {
        cctpText += `\n--- ${file.file_name} ---\n${text}`;
      }
    }
  }

  // Build RC text
  let rcText = "";
  if (rcResult.data && rcResult.data.length > 0) {
    for (const file of rcResult.data) {
      const text = extractText(file.parsed_content);
      if (text) {
        rcText += `\n--- ${file.file_name} ---\n${text}`;
      }
    }
  }

  // Build company info
  const company = companyResult.data;
  const companyInfo = company
    ? `Entreprise candidate : ${company.name}${company.siret ? ` (SIRET: ${company.siret})` : ""}${company.address ? `, ${company.address}` : ""}`
    : "";

  // Build user message with truncation
  let userMessage = `Genere un memoire technique pour le projet suivant :\n\n`;
  userMessage += `Projet : ${project.name}\n`;
  if (project.reference) {
    userMessage += `Reference : ${project.reference}\n`;
  }
  if (companyInfo) {
    userMessage += `${companyInfo}\n`;
  }

  if (rcText) {
    const truncatedRc = rcText.slice(0, Math.floor(MAX_CONTENT_LENGTH * 0.4));
    userMessage += `\n## Reglement de consultation (RC) — criteres de jugement\n${truncatedRc}\n`;
  }

  if (cctpText) {
    const remaining = MAX_CONTENT_LENGTH - userMessage.length;
    const truncatedCctp = cctpText.slice(0, Math.max(0, remaining));
    userMessage += `\n## CCTP — Description des travaux\n${truncatedCctp}\n`;
  }

  // Call Mistral AI
  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_MEMOIR },
      { role: "user", content: userMessage },
    ],
    "mistral-medium-latest"
  );

  const responseText = typeof response === "string" ? response : String(response);
  const sections = parseSectionsResponse(responseText);

  // Delete existing sections for this project before inserting new ones
  await supabase
    .from("memoire_sections")
    .delete()
    .eq("project_id", projectId);

  // Insert sections into DB
  const rows = sections.map((section, index) => ({
    project_id: projectId,
    section_order: index + 1,
    title: section.title,
    content: section.content,
    is_validated: false,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("memoire_sections")
    .insert(rows)
    .select();

  if (insertError) {
    throw new Error(`Failed to insert memoir sections: ${insertError.message}`);
  }

  // Fire-and-forget audit log
  logAction(supabase, {
    companyId: project.company_id,
    projectId,
    action: "memoir.generate",
    details: { sections_count: sections.length },
  });

  return inserted as MemoireSection[];
}

/**
 * Extract text content from parsed_content JSON.
 */
function extractText(parsedContent: Record<string, unknown> | null): string {
  if (!parsedContent) return "";
  if (typeof parsedContent === "string") return parsedContent;
  if (typeof parsedContent.text === "string") return parsedContent.text;
  if (typeof parsedContent.content === "string") return parsedContent.content;
  return JSON.stringify(parsedContent);
}

/**
 * Parse the AI response into an array of { title, content }.
 */
function parseSectionsResponse(responseText: string): ParsedMemoirSection[] {
  try {
    let jsonStr = responseText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as ParsedMemoirSection[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Response is not a non-empty array");
    }

    return parsed.map((s) => ({
      title: typeof s.title === "string" ? s.title : "Section sans titre",
      content: typeof s.content === "string" ? s.content : "",
    }));
  } catch (err) {
    console.error("[generateMemoir] Failed to parse AI response:", err);
    console.error("[generateMemoir] Raw response:", responseText.slice(0, 500));
    // Return default sections on parse failure
    return [
      { title: "Presentation de l'entreprise", content: "Section a completer." },
      { title: "Comprehension du projet", content: "Section a completer." },
      { title: "Methodologie et organisation du chantier", content: "Section a completer." },
      { title: "Moyens humains", content: "Section a completer." },
      { title: "Moyens materiels", content: "Section a completer." },
      { title: "Planning previsionnel", content: "Section a completer." },
      { title: "Gestion de la qualite, securite et environnement (QSE)", content: "Section a completer." },
      { title: "Developpement durable et RSE", content: "Section a completer." },
    ];
  }
}
