import { Router } from 'express';
import upload from '../middleware/upload.js';
import { uploadToFirebase, deleteFromFirebase } from '../utils/firebaseStorage.js';

const router = Router();

/**
 * POST /api/upload
 * Upload a single image file to Firebase Storage.
 *
 * Expects: multipart/form-data with field name "image"
 * Returns: { message, imageUrl, originalName, size }
 *
 * Pipeline stage 1 of 5: this only handles upload to Firebase.
 * The full pipeline (OCR + AI + MongoDB) is at POST /api/bills (Step 5).
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided. Use form field name "image".',
      });
    }

    const imageUrl = await uploadToFirebase(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(200).json({
      message: 'File uploaded successfully',
      imageUrl,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/upload?url=<publicUrl>
 * Delete a previously uploaded file from Firebase Storage.
 *
 * Optional utility endpoint — not part of the main pipeline.
 */
router.delete('/', async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Query parameter "url" is required' });
    }

    await deleteFromFirebase(url);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
