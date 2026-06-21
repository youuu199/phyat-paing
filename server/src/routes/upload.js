import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryStorage.js';

const router = Router();

// All upload routes require authentication
router.use(auth);

// Rate limiter for upload endpoints — prevents storage abuse
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute per IP
  message: { error: 'Too many uploads, please wait before trying again' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/upload
 * Upload a single image file to Cloudinary.
 *
 * Expects: multipart/form-data with field name "image"
 * Returns: { message, imageUrl, publicId, originalName, size }
 *
 * This only handles the image upload step in isolation.
 * The full pipeline (OCR + AI + MongoDB) is at POST /api/bills.
 */
router.post('/', uploadLimiter, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided. Use form field name "image".',
      });
    }

    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(200).json({
      message: 'File uploaded successfully',
      imageUrl: url,
      publicId,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/upload?publicId=<publicId>
 * Delete a previously uploaded file from Cloudinary.
 *
 * Optional utility endpoint — not part of the main pipeline.
 */
router.delete('/', async (req, res, next) => {
  try {
    const { publicId } = req.query;

    if (!publicId) {
      return res.status(400).json({ error: 'Query parameter "publicId" is required' });
    }

    await deleteFromCloudinary(publicId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
