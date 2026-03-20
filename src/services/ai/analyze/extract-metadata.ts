import { chatCompletion } from "@/lib/mistral";
import { SYSTEM_ANALYZE_DCE } from "@/lib/prompts/analyze";

export interface DceMetadata {
  projectName: string;
  reference: string;
  deadline: string | null; // ISO 8601
  source: "public" | "private";
  lots: { number: string; name: string }[];
  criteria: { name: string; weight: number }[];
  requiredDocs: string[];
}

const MAX_CONTENT_LENGTH = 30_000;

/** File type priority for metadata extraction (lower = higher priority) */
const FILE_TYPE_PRIORITY: Record<string, number> = {
  rc: 0,
  aapc: 1,
  other: 2,
  cctp: 3,
  dpgf: 4,
  plan: 5,
};

function getPriority(fileType: string): number {
  return FILE_TYPE_PRIORITY[fileType] ?? 99;
}

/**
 * Extract DCE metadata from parsed file contents using Mistral AI.
 * Prioritizes RC and AAPC files for metadata extraction.
 */
export async function extractDceMetadata(
  parsedFiles: { fileType: string; text: string; fileName: string }[]
): Promise<DceMetadata> {
  // Sort files by priority: RC first, then AAPC, then others
  const sorted = [...parsedFiles].sort(
    (a, b) => getPriority(a.fileType) - getPriority(b.fileType)
  );

  // Build concatenated content, truncating to MAX_CONTENT_LENGTH
  let content = "";
  for (const file of sorted) {
    const header = `\n\n--- DOCUMENT: ${file.fileName} (type: ${file.fileType}) ---\n\n`;
    const remaining = MAX_CONTENT_LENGTH - content.length;
    if (remaining <= header.length) break;

    content += header;
    const textBudget = remaining - header.length;
    content += file.text.slice(0, textBudget);
  }

  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_ANALYZE_DCE },
      {
        role: "user",
        content: `Analyse les documents DCE suivants et extrais les metadonnees au format JSON :\n\n${content}`,
      },
    ],
    "mistral-large-latest"
  );

  const responseText = typeof response === "string" ? response : String(response);

  return parseMetadataResponse(responseText);
}

/**
 * Parse the AI response into DceMetadata, with sensible defaults on failure.
 */
function parseMetadataResponse(responseText: string): DceMetadata {
  const defaults: DceMetadata = {
    projectName: "Projet sans nom",
    reference: "",
    deadline: null,
    source: "private",
    lots: [],
    criteria: [],
    requiredDocs: [],
  };

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    return {
      projectName:
        typeof parsed.projectName === "string" && parsed.projectName.length > 0
          ? parsed.projectName
          : defaults.projectName,
      reference:
        typeof parsed.reference === "string" ? parsed.reference : defaults.reference,
      deadline:
        typeof parsed.deadline === "string" && parsed.deadline.length > 0
          ? parsed.deadline
          : null,
      source:
        parsed.source === "public" || parsed.source === "private"
          ? parsed.source
          : defaults.source,
      lots: Array.isArray(parsed.lots)
        ? parsed.lots.map((l: Record<string, unknown>) => ({
            number: String(l.number ?? ""),
            name: String(l.name ?? ""),
          }))
        : defaults.lots,
      criteria: Array.isArray(parsed.criteria)
        ? parsed.criteria.map((c: Record<string, unknown>) => ({
            name: String(c.name ?? ""),
            weight: typeof c.weight === "number" ? c.weight : 0,
          }))
        : defaults.criteria,
      requiredDocs: Array.isArray(parsed.requiredDocs)
        ? parsed.requiredDocs.map((d: unknown) => String(d))
        : defaults.requiredDocs,
    };
  } catch (err) {
    console.error("[extractDceMetadata] Failed to parse AI response:", err);
    console.error("[extractDceMetadata] Raw response:", responseText.slice(0, 500));
    return defaults;
  }
}
