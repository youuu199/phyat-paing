import Tesseract from 'tesseract.js';
import os from 'os';
import path from 'path';

/** Worker pool size — handles up to this many concurrent OCR jobs */
const POOL_SIZE = 3;

/** Cached scheduler — created once, reused across requests */
let scheduler = null;

/**
 * Lazy-init a Tesseract scheduler with a pool of workers.
 * Supports English + Myanmar language data.
 *
 * A scheduler lets multiple `recognize()` calls run concurrently
 * (up to POOL_SIZE). Without it, a single worker serializes all
 * jobs and the second upload blocks until the first finishes —
 * causing a request timeout.
 *
 * @returns {Promise<Tesseract.Scheduler>}
 */
async function getScheduler() {
  if (scheduler) return scheduler;

  scheduler = Tesseract.createScheduler();

  // Spin up multiple workers in parallel
  const workers = await Promise.all(
    Array.from({ length: POOL_SIZE }, () =>
      Tesseract.createWorker('eng+mya', 1, {
        cachePath: path.join(os.tmpdir(), 'tesseract-cache'),
        logger: (m) => {
          if (m.status === 'error') console.error('[tesseract]', m);
        },
      })
    )
  );

  for (const w of workers) {
    scheduler.addWorker(w);
  }

  console.log(`[tesseract] Scheduler ready with ${POOL_SIZE} workers (eng+mya)`);
  return scheduler;
}

/**
 * Extract raw text from a bill/receipt image using Tesseract.js OCR.
 *
 * FREE — no API keys, no billing, runs entirely offline.
 * Supports English and Myanmar (Burmese) text extraction.
 * Uses a worker pool so concurrent uploads don't block each other.
 *
 * @param {Buffer} imageBuffer - Raw image bytes (from multer req.file.buffer)
 * @returns {Promise<string>}   - Full extracted text, or empty string if no text found
 */
export async function extractTextFromImage(imageBuffer) {
  const sched = await getScheduler();

  const { data } = await sched.addJob('recognize', imageBuffer);

  if (!data.text || data.text.trim().length === 0) {
    console.warn('[tesseract] No text extracted — image may be blank or unreadable');
    return '';
  }

  console.log(`[tesseract] Extracted ${data.text.length} chars, confidence: ${Math.round(data.confidence)}%`);
  return data.text.trim();
}

/**
 * Terminate all Tesseract workers (call on server shutdown).
 */
export async function shutdownOCR() {
  if (scheduler) {
    await scheduler.terminate();
    scheduler = null;
    console.log('[tesseract] Scheduler terminated');
  }
}
