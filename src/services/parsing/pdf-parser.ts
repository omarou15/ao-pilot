import pdfParse from 'pdf-parse';

export async function parsePdf(
  buffer: Buffer
): Promise<{ text: string; pages: number }> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text?.trim() ?? '';
    const pages = data.numpages ?? 0;

    if (!text) {
      console.warn(
        '[pdf-parser] PDF contains no extractable text — likely a scanned document. OCR needed.'
      );
      return { text: '', pages };
    }

    return { text, pages };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`[pdf-parser] Failed to parse PDF: ${message}`);
    return { text: '', pages: 0 };
  }
}
