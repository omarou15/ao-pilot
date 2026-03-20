import mammoth from 'mammoth';

export async function parseWord(
  buffer: Buffer
): Promise<{ text: string; html: string }> {
  try {
    const [textResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ buffer }),
      mammoth.convertToHtml({ buffer }),
    ]);

    return {
      text: textResult.value.trim(),
      html: htmlResult.value.trim(),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`[word-parser] Failed to parse Word document: ${message}`);
    return { text: '', html: '' };
  }
}
