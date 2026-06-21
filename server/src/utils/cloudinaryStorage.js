import { v2 as cloudinary } from 'cloudinary';
import pRetry from 'p-retry';

/**
 * Cloudinary image storage provider.
 *
 * Uses upload_stream() for in-memory Buffer uploads (no temp files).
 * Returns the secure_url after upload and stores the public_id for later deletion.
 *
 * Configuration: set CLOUDINARY_URL in .env or individual vars:
 *   CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 *
 * Anti-patterns avoided:
 *  - NOT using upload() with a Buffer (expects file path or URL only)
 *  - NOT looking for uploader.uploadBuffer() (does not exist)
 *  - Wrapping callback-based upload_stream() in a Promise for async/await
 */

let configured = false;

function ensureConfig() {
  if (configured) return;

  // CLOUDINARY_URL is the single-connection-string form
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  configured = true;
}

/**
 * Upload a file buffer to Cloudinary with retry logic.
 *
 * @param {Buffer} buffer       - File buffer from multer (req.file.buffer)
 * @param {string} originalname - Original filename (stored as metadata)
 * @param {string} mimetype     - MIME type (e.g. 'image/jpeg')
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(buffer, originalname, mimetype) {
  ensureConfig();

  const doUpload = () => new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'bill-organizer',
        public_id: `${timestamp}_${safeName}`,
        resource_type: 'image',
        // Store original filename in metadata for future reference
        context: `originalname=${originalname}`,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });

  return pRetry(doUpload, { retries: 2, minTimeout: 1000 });
}

/**
 * Delete an image from Cloudinary by its public_id (with retry).
 *
 * @param {string} publicId - The public_id returned from uploadToCloudinary()
 */
export async function deleteFromCloudinary(publicId) {
  ensureConfig();

  const doDelete = async () => {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
    return result;
  };

  return pRetry(doDelete, { retries: 2, minTimeout: 1000 });
}
