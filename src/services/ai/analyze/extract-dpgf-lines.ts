import { chatCompletion } from "@/lib/mistral";
import { SYSTEM_EXTRACT_DPGF } from "@/lib/prompts/analyze";

export interface DpgfLineInput {
  lot: string;
  sub_lot?: string;
  designation: string;
  unit: string;
  quantity: number | null;
  sort_order: number;
}

/**
 * Structured Excel data shape: sheets with rows of detected DPGF columns.
 */
interface StructuredSheet {
  name?: string;
  rows?: Record<string, unknown>[];
}

/** Column name variations for DPGF Excel files */
const COL_PATTERNS = {
  lot: /^(lot|n[°o]?\s*lot)/i,
  sub_lot: /^(sous[_\s-]?lot|s\.?lot)/i,
  designation: /^(d[eé]signation|libell[eé]|description|ouvrage|intitul[eé])/i,
  unit: /^(unit[eé]|u\.?|unite)/i,
  quantity: /^(quantit[eé]|qt[eé]?|qte|nb|nombre)/i,
};

function findColumn(
  headers: string[],
  pattern: RegExp
): string | undefined {
  return headers.find((h) => pattern.test(h.trim()));
}

/**
 * Try to map structured Excel data directly to DpgfLineInput[].
 * Returns null if the data does not look like a structured DPGF.
 */
function mapStructuredData(
  structured: unknown
): DpgfLineInput[] | null {
  if (!structured || typeof structured !== "object") return null;

  const sheets: StructuredSheet[] = Array.isArray(structured)
    ? (structured as StructuredSheet[])
    : Object.values(structured as Record<string, unknown>).filter(
        (v): v is StructuredSheet => typeof v === "object" && v !== null
      );

  const lines: DpgfLineInput[] = [];
  let globalOrder = 1;

  for (const sheet of sheets) {
    const rows = sheet?.rows;
    if (!Array.isArray(rows) || rows.length === 0) continue;

    // Detect columns from the first row's keys
    const headers = Object.keys(rows[0] as Record<string, unknown>);
    const colLot = findColumn(headers, COL_PATTERNS.lot);
    const colDesignation = findColumn(headers, COL_PATTERNS.designation);
    const colUnit = findColumn(headers, COL_PATTERNS.unit);
    const colQuantity = findColumn(headers, COL_PATTERNS.quantity);
    const colSubLot = findColumn(headers, COL_PATTERNS.sub_lot);

    // Must have at least designation to consider it structured DPGF
    if (!colDesignation) continue;

    for (const row of rows) {
      const r = row as Record<string, unknown>;
      const designation = String(r[colDesignation] ?? "").trim();
      if (!designation) continue;

      const qty = colQuantity ? Number(r[colQuantity]) : null;

      lines.push({
        lot: colLot ? String(r[colLot] ?? "").trim() : "",
        sub_lot: colSubLot ? String(r[colSubLot] ?? "").trim() || undefined : undefined,
        designation,
        unit: colUnit ? String(r[colUnit] ?? "").trim() : "",
        quantity: qty !== null && !isNaN(qty) ? qty : null,
        sort_order: globalOrder++,
      });
    }
  }

  return lines.length > 0 ? lines : null;
}

/**
 * Extract DPGF lines from DPGF content (structured Excel or PDF text),
 * optionally using CCTP text to fill in missing quantities.
 */
export async function extractDpgfLines(
  dpgfContent: { text?: string; structured?: unknown },
  cctpText: string
): Promise<DpgfLineInput[]> {
  // 1. Try direct mapping from structured Excel data
  const directLines = mapStructuredData(dpgfContent.structured);
  if (directLines && directLines.length > 0) {
    // Check if we have missing quantities that CCTP might help with
    const hasMissingQty = directLines.some((l) => l.quantity === null);

    if (!hasMissingQty || !cctpText.trim()) {
      return sortLines(directLines);
    }

    // Use AI to fill missing quantities from CCTP
    return fillMissingQuantities(directLines, cctpText);
  }

  // 2. Fall back to AI extraction from text content
  const dpgfText = dpgfContent.text ?? "";
  if (!dpgfText.trim()) {
    return [];
  }

  return extractViaAi(dpgfText, cctpText);
}

/**
 * Use AI to extract DPGF lines from PDF/text content.
 */
async function extractViaAi(
  dpgfText: string,
  cctpText: string
): Promise<DpgfLineInput[]> {
  let userContent = `Voici le contenu du DPGF :\n\n${dpgfText.slice(0, 25_000)}`;

  if (cctpText.trim()) {
    userContent += `\n\n--- CCTP (pour completer les quantites manquantes) ---\n\n${cctpText.slice(0, 10_000)}`;
  }

  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_EXTRACT_DPGF },
      { role: "user", content: userContent },
    ],
    "mistral-large-latest"
  );

  const responseText = typeof response === "string" ? response : String(response);
  return parseAiLinesResponse(responseText);
}

/**
 * Use AI to fill missing quantities in structured lines using CCTP context.
 */
async function fillMissingQuantities(
  lines: DpgfLineInput[],
  cctpText: string
): Promise<DpgfLineInput[]> {
  const missingLines = lines.filter((l) => l.quantity === null);

  const prompt = `Voici des lignes DPGF avec des quantites manquantes. En utilisant le CCTP ci-dessous, essaie de deduire les quantites.

Lignes avec quantites manquantes :
${JSON.stringify(missingLines, null, 2)}

--- CCTP ---
${cctpText.slice(0, 15_000)}

Retourne UNIQUEMENT un tableau JSON avec les memes lignes, en remplissant le champ "quantity" quand c'est possible (sinon laisser null).`;

  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_EXTRACT_DPGF },
      { role: "user", content: prompt },
    ],
    "mistral-large-latest"
  );

  const responseText = typeof response === "string" ? response : String(response);

  try {
    const filled = parseAiLinesResponse(responseText);
    const filledMap = new Map<number, DpgfLineInput>();
    for (const f of filled) {
      filledMap.set(f.sort_order, f);
    }

    // Merge filled quantities back into original lines
    return sortLines(
      lines.map((line) => {
        if (line.quantity !== null) return line;
        const filledLine = filledMap.get(line.sort_order);
        return filledLine ? { ...line, quantity: filledLine.quantity } : line;
      })
    );
  } catch {
    // If AI filling fails, return lines as-is
    return sortLines(lines);
  }
}

/**
 * Parse AI JSON array response into DpgfLineInput[].
 */
function parseAiLinesResponse(responseText: string): DpgfLineInput[] {
  try {
    let jsonStr = responseText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.designation === "string" &&
          (item.designation as string).trim().length > 0
      )
      .map((item, idx) => ({
        lot: String(item.lot ?? ""),
        sub_lot: item.sub_lot ? String(item.sub_lot) : undefined,
        designation: String(item.designation),
        unit: String(item.unit ?? ""),
        quantity:
          typeof item.quantity === "number" && !isNaN(item.quantity as number)
            ? (item.quantity as number)
            : null,
        sort_order:
          typeof item.sort_order === "number" ? (item.sort_order as number) : idx + 1,
      }));
  } catch (err) {
    console.error("[extractDpgfLines] Failed to parse AI response:", err);
    return [];
  }
}

/**
 * Sort lines by lot (natural sort) then by sort_order.
 */
function sortLines(lines: DpgfLineInput[]): DpgfLineInput[] {
  return [...lines].sort((a, b) => {
    const lotCmp = a.lot.localeCompare(b.lot, undefined, { numeric: true });
    if (lotCmp !== 0) return lotCmp;
    return a.sort_order - b.sort_order;
  });
}
