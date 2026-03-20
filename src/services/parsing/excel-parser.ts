import * as XLSX from 'xlsx';

export interface ExcelSheet {
  name: string;
  headers: string[];
  rows: Record<string, string | number | null>[];
}

/**
 * Parse all sheets of an Excel workbook from a buffer.
 * Handles merged cells via XLSX's built-in de-merge.
 */
export async function parseExcel(
  buffer: Buffer
): Promise<{ sheets: ExcelSheet[] }> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellMerges: true });
    const sheets: ExcelSheet[] = [];

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      if (!ws) continue;

      // De-merge cells: fill merged regions with the top-left value
      if (ws['!merges']) {
        for (const merge of ws['!merges']) {
          const origin = ws[XLSX.utils.encode_cell(merge.s)];
          if (!origin) continue;
          for (let r = merge.s.r; r <= merge.e.r; r++) {
            for (let c = merge.s.c; c <= merge.e.c; c++) {
              if (r === merge.s.r && c === merge.s.c) continue;
              const addr = XLSX.utils.encode_cell({ r, c });
              ws[addr] = { ...origin };
            }
          }
        }
      }

      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
        defval: null,
        raw: false,
      });

      // Extract headers from the first row keys, or fall back to sheet range
      const headers: string[] =
        jsonData.length > 0
          ? Object.keys(jsonData[0]).map(String)
          : extractHeadersFromRange(ws);

      const rows: ExcelSheet['rows'] = jsonData.map((row) => {
        const mapped: Record<string, string | number | null> = {};
        for (const header of headers) {
          const val = row[header];
          if (val === null || val === undefined) {
            mapped[header] = null;
          } else if (typeof val === 'number') {
            mapped[header] = val;
          } else {
            mapped[header] = String(val);
          }
        }
        return mapped;
      });

      sheets.push({ name: sheetName, headers, rows });
    }

    return { sheets };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`[excel-parser] Failed to parse Excel: ${message}`);
    return { sheets: [] };
  }
}

function extractHeadersFromRange(ws: XLSX.WorkSheet): string[] {
  const ref = ws['!ref'];
  if (!ref) return [];
  const range = XLSX.utils.decode_range(ref);
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })];
    headers.push(cell ? String(cell.v) : `Column${c + 1}`);
  }
  return headers;
}

// ─── DPGF column detection ───────────────────────────────────────────────────

interface DpgfColumnMapping {
  lot?: string;
  designation?: string;
  unit?: string;
  quantity?: string;
  unitPrice?: string;
  total?: string;
}

const DPGF_PATTERNS: Record<keyof DpgfColumnMapping, RegExp[]> = {
  lot: [/^lot$/i, /^n°\s*lot$/i, /^n°lot$/i, /^num[eé]ro\s*lot$/i],
  designation: [
    /d[eé]signation/i,
    /libell[eé]/i,
    /description/i,
    /intitul[eé]/i,
    /ouvrage/i,
  ],
  unit: [/^unit[eé]$/i, /^unite$/i, /^u$/i],
  quantity: [
    /quantit[eé]/i,
    /quantite/i,
    /^qt[eé]$/i,
    /^qte$/i,
    /^q$/i,
  ],
  unitPrice: [
    /prix\s*unitaire/i,
    /^pu$/i,
    /prix\s*unit/i,
    /^p\.u\.?$/i,
  ],
  total: [/^montant$/i, /^total$/i, /total\s*ht/i, /montant\s*ht/i],
};

/**
 * Attempts to identify which columns map to DPGF fields
 * by matching header names against known French patterns.
 */
export function detectDpgfColumns(sheet: ExcelSheet): DpgfColumnMapping {
  const mapping: DpgfColumnMapping = {};

  for (const header of sheet.headers) {
    const trimmed = header.trim();
    for (const [field, patterns] of Object.entries(DPGF_PATTERNS) as [
      keyof DpgfColumnMapping,
      RegExp[],
    ][]) {
      if (mapping[field]) continue; // already matched
      for (const pattern of patterns) {
        if (pattern.test(trimmed)) {
          mapping[field] = header;
          break;
        }
      }
    }
  }

  return mapping;
}
