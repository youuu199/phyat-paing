import { getStorage } from 'firebase-admin/storage';

/**
 * Upload a file buffer to Firebase Storage and return the public URL.
 *
 * Strategy:
 *  1. Generate a unique filename: bills/<timestamp>_<sanitized-name>
 *  2. Save buffer with correct contentType so browsers render images, not download
 *  3. Make file public so the frontend can display it directly via <img>
 *  4. Return the direct Google Cloud Storage public URL
 *
 * @param {Buffer} buffer       - File buffer from multer (req.file.buffer)
 * @param {string} originalname - Original filename for the extension hint
 * @param {string} mimetype     - MIME type from multer (req.file.mimetype)
 * @returns {Promise<string>}   - Public HTTPS URL of the uploaded file
 *
 * Anti-patterns avoided:
 *  - Not using bucket.upload() with a Buffer (expects file path)
 *  - Not relying on getDownloadURL() (requires downloadTokens metadata)
 *  - Not passing gs:// URI to bucket()
 */
export async function uploadToFirebase(buffer, originalname, mimetype) {
  const bucket = getStorage().bucket();

  // Generate a unique filename to prevent collisions
  const timestamp = Date.now();
  const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destination = `bills/${timestamp}_${safeName}`;

  const file = bucket.file(destination);

  await file.save(buffer, {
    contentType: mimetype,
    metadata: {
      metadata: {
        originalName: originalname,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
  return publicUrl;
}

/**
 * Delete a file from Firebase Storage by its public URL.
 *
 * Parses the GCS public URL format:
 *   https://storage.googleapis.com/<bucket-name>/<file-path>
 *
 * @param {string} publicUrl - Full public URL returned by uploadToFirebase()
 */
export async function deleteFromFirebase(publicUrl) {
  const bucket = getStorage().bucket();

  // Extract path from: https://storage.googleapis.com/BUCKET/bills/timestamp_file.jpg
  const url = new URL(publicUrl);
  const parts = url.pathname.split('/');
  // parts = ['', 'bucket-name', 'bills', 'timestamp_file.jpg']
  const bucketName = parts[1];
  const filePath = parts.slice(2).join('/');

  if (bucketName !== bucket.name) {
    console.warn(
      `URL bucket "${bucketName}" does not match configured bucket "${bucket.name}" — deleting anyway`
    );
  }

  await bucket.file(filePath).delete();
}
