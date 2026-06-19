import multer from 'multer';

/**
 * Multer middleware configured for memory storage.
 * File is available as req.file.buffer after upload — no temp files on disk.
 *
 * Limits:
 *  - 10 MB max file size
 *  - Only image MIME types (JPEG, PNG, WebP, GIF, BMP, TIFF)
 *
 * Usage:
 *  import upload from './middleware/upload.js';
 *  router.post('/', upload.single('image'), handler);
 *
 * Anti-patterns avoided:
 *  - Not using diskStorage (unnecessary I/O; the file goes straight to Cloudinary)
 *  - Not accepting HEIC/PDF/SVG (unsupported by Vision API for this use case)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF, BMP, TIFF`));
    }
  },
});

export default upload;
