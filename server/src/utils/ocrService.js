import vision from '@google-cloud/vision';

/**
 * Extract raw text from a bill/receipt image using Google Cloud Vision OCR.
 *
 * Optimized for dense documents (bills, receipts) with Myanmar + English support.
 *
 * @param {Buffer} imageBuffer - Raw image bytes (from multer req.file.buffer)
 * @returns {Promise<string>}   - Full extracted text, or empty string if no text found
 *
 * Anti-patterns avoided:
 *  - Using textDetection() — only returns ~10 annotations max
 *  - Using API key auth — requires service account credentials
 *  - Not handling private_key \n escaping from env vars
 */
export async function extractTextFromImage(imageBuffer) {
  const client = new vision.ImageAnnotatorClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
  });

  // Encode to base64 so we can attach imageContext (language hints)
  // Passing a Buffer directly doesn't allow per-request options
  const base64Image = imageBuffer.toString('base64');

  const [result] = await client.documentTextDetection({
    image: { content: base64Image },
    imageContext: {
      languageHints: ['en', 'my'], // English first, then Myanmar (Burmese)
    },
  });

  if (!result.fullTextAnnotation) {
    console.warn('Vision OCR returned no text — image may be blank or unreadable');
    return '';
  }

  return result.fullTextAnnotation.text;
}
