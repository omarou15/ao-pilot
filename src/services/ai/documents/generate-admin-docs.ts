import { chatCompletion } from "@/lib/mistral";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { SYSTEM_ADMIN_DOCS } from "@/lib/prompts/documents";
import type { AdminDoc } from "@/lib/types";

const MAX_CONTENT_LENGTH = 20_000;

interface ParsedAdminDoc {
  doc_type: string;
  doc_name: string;
  is_generated: boolean;
  template_content?: string;
}

interface CompanyData {
  name: string;
  siret: string | null;
  address: string | null;
}

/**
 * Generate admin documents list + pre-filled templates for a project.
 * Analyzes RC to identify required documents, generates templates with placeholders,
 * and replaces placeholders with company data where available.
 */
export async function generateAdminDocs(projectId: string): Promise<AdminDoc[]> {
  const supabase = getServiceClient();

  // Fetch project metadata
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, company_id, name, reference")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Fetch RC files and company info in parallel
  const [rcResult, companyResult] = await Promise.all([
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

  // Build user message
  let userMessage = `Identifie les documents administratifs requis pour cet appel d'offres et genere les modeles pre-remplis.\n\n`;
  userMessage += `Projet : ${project.name}\n`;
  if (project.reference) {
    userMessage += `Reference : ${project.reference}\n`;
  }

  if (rcText) {
    const truncated = rcText.slice(0, MAX_CONTENT_LENGTH);
    userMessage += `\n## Reglement de consultation (RC)\n${truncated}\n`;
  } else {
    userMessage += `\nAucun RC fourni. Retourne la liste standard des documents administratifs couramment exiges pour un appel d'offres BTP.\n`;
  }

  // Call Mistral AI
  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_ADMIN_DOCS },
      { role: "user", content: userMessage },
    ],
    "mistral-medium-latest"
  );

  const responseText = typeof response === "string" ? response : String(response);
  let docs = parseAdminDocsResponse(responseText);

  // Replace placeholders with company data where available
  const company = companyResult.data;
  if (company) {
    docs = docs.map((doc) => ({
      ...doc,
      template_content: doc.template_content
        ? fillPlaceholders(doc.template_content, company, project.name, project.reference)
        : undefined,
    }));
  }

  // Delete existing admin docs for this project before inserting new ones
  await supabase
    .from("admin_docs")
    .delete()
    .eq("project_id", projectId);

  // Insert into DB
  const rows = docs.map((doc) => ({
    project_id: projectId,
    doc_type: doc.doc_type,
    doc_name: doc.doc_name,
    is_generated: doc.is_generated,
    is_validated: false,
    storage_path: null,
    template_content: doc.template_content ?? null,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("admin_docs")
    .insert(rows)
    .select();

  if (insertError) {
    throw new Error(`Failed to insert admin docs: ${insertError.message}`);
  }

  // Fire-and-forget audit log
  logAction(supabase, {
    companyId: project.company_id,
    projectId,
    action: "admin_docs.generate",
    details: {
      docs_count: docs.length,
      generated_count: docs.filter((d) => d.is_generated).length,
    },
  });

  return inserted as AdminDoc[];
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
 * Replace placeholder fields with actual company data where available.
 */
function fillPlaceholders(
  template: string,
  company: CompanyData,
  projectName: string,
  projectReference: string | null
): string {
  let result = template;

  if (company.name) {
    result = result.replace(/\[NOM_ENTREPRISE\]/g, company.name);
  }
  if (company.siret) {
    result = result.replace(/\[SIRET\]/g, company.siret);
  }
  if (company.address) {
    result = result.replace(/\[ADRESSE\]/g, company.address);
  }
  if (projectName) {
    result = result.replace(/\[OBJET_MARCHE\]/g, projectName);
  }
  if (projectReference) {
    result = result.replace(/\[REFERENCE_MARCHE\]/g, projectReference);
  }

  // Fill date with today
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  result = result.replace(/\[DATE\]/g, today);

  return result;
}

/**
 * Parse the AI response into an array of admin doc definitions.
 */
function parseAdminDocsResponse(responseText: string): ParsedAdminDoc[] {
  try {
    let jsonStr = responseText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as ParsedAdminDoc[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Response is not a non-empty array");
    }

    return parsed.map((d) => ({
      doc_type: typeof d.doc_type === "string" ? d.doc_type : "unknown",
      doc_name: typeof d.doc_name === "string" ? d.doc_name : "Document inconnu",
      is_generated: typeof d.is_generated === "boolean" ? d.is_generated : false,
      template_content: typeof d.template_content === "string" ? d.template_content : undefined,
    }));
  } catch (err) {
    console.error("[generateAdminDocs] Failed to parse AI response:", err);
    console.error("[generateAdminDocs] Raw response:", responseText.slice(0, 500));
    // Return default list on parse failure
    return [
      { doc_type: "dc1", doc_name: "DC1 - Lettre de candidature", is_generated: true, template_content: "LETTRE DE CANDIDATURE\n\nObjet du marche : [OBJET_MARCHE]\nReference : [REFERENCE_MARCHE]\n\nCandidat :\nRaison sociale : [NOM_ENTREPRISE]\nSIRET : [SIRET]\nAdresse : [ADRESSE]\nRepresentant legal : [REPRESENTANT]\n\nFait a [ADRESSE], le [DATE]\n\nSignature du representant legal" },
      { doc_type: "dc2", doc_name: "DC2 - Declaration du candidat", is_generated: true, template_content: "DECLARATION DU CANDIDAT\n\nIdentification :\nRaison sociale : [NOM_ENTREPRISE]\nSIRET : [SIRET]\nAdresse : [ADRESSE]\n\nCapacites economiques et financieres :\nChiffre d'affaires global des 3 derniers exercices : ___\n\nCapacites techniques :\nEffectif moyen annuel : ___\nReferences de travaux similaires : ___\n\nFait a [ADRESSE], le [DATE]\nSignature" },
      { doc_type: "attestation_honneur", doc_name: "Attestation sur l'honneur", is_generated: true, template_content: "ATTESTATION SUR L'HONNEUR\n\nJe soussigne(e), [REPRESENTANT], representant legal de la societe [NOM_ENTREPRISE] (SIRET : [SIRET]), dont le siege social est situe [ADRESSE],\n\nAtteste sur l'honneur :\n- Que la societe ne fait l'objet d'aucune interdiction de soumissionner aux marches publics\n- Que la societe est en regle au regard de ses obligations fiscales et sociales\n- Que les renseignements fournis dans le cadre de cette candidature sont exacts\n\nFait a [ADRESSE], le [DATE]\n\nSignature du representant legal" },
      { doc_type: "kbis", doc_name: "Extrait Kbis de moins de 3 mois", is_generated: false },
      { doc_type: "assurance_decennale", doc_name: "Attestation d'assurance decennale", is_generated: false },
      { doc_type: "assurance_rc", doc_name: "Attestation d'assurance RC professionnelle", is_generated: false },
      { doc_type: "urssaf", doc_name: "Attestation URSSAF / Attestation de vigilance", is_generated: false },
      { doc_type: "impots", doc_name: "Attestations fiscales", is_generated: false },
    ];
  }
}
