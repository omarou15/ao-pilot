import { PDFParse } from 'pdf-parse';

export async function parsePdf(
  buffer: Buffer
): Promise<{ text: string; pages: number }> {
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    const text = textResult.text?.trim() ?? '';
    const pages = textResult.total ?? 0;

    await parser.destroy();

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
