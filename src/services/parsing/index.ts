export { parsePdf } from './pdf-parser';
export { parseExcel, detectDpgfColumns } from './excel-parser';
export type { ExcelSheet } from './excel-parser';
export { parseWord } from './word-parser';
export { detectDocumentType } from './detect-file-type';
export type { FileType } from './detect-file-type';

import { parsePdf } from './pdf-parser';
import { parseExcel } from './excel-parser';
import { parseWord } from './word-parser';
import { detectDocumentType, type FileType } from './detect-file-type';

const PDF_MIME = 'application/pdf';
const EXCEL_MIMES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const WORD_MIMES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Unified entry point: parses any supported file and detects its DCE type.
 */
export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ text: string; structured?: unknown; fileType: FileType }> {
  let text = '';
  let structured: unknown = undefined;

  if (mimeType === PDF_MIME) {
    const result = await parsePdf(buffer);
    text = result.text;
  } else if (EXCEL_MIMES.includes(mimeType)) {
    const result = await parseExcel(buffer);
    structured = result.sheets;
    // Build a text representation from all sheets for type detection
    text = result.sheets
      .flatMap((s) =>
        s.rows.map((r) =>
          Object.values(r)
            .filter((v) => v !== null)
            .join(' ')
        )
      )
      .join('\n');
  } else if (WORD_MIMES.includes(mimeType)) {
    const result = await parseWord(buffer);
    text = result.text;
  } else {
    console.warn(
      `[parseFile] Unsupported MIME type: ${mimeType} for file ${fileName}`
    );
  }

  const fileType = detectDocumentType(fileName, text);

  return { text, structured, fileType };
}
