import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryStorage.js';
import { extractTextFromImage } from '../utils/ocrService.js';
import { classifyBillData } from '../utils/cohereService.js';

/**
 * POST /api/bills
 *
 * Full pipeline: upload image → Cloudinary → Vision OCR → Cohere AI → MongoDB.
 * Scoped to the authenticated user (req.userId set by auth middleware).
 *
 * Expects: multipart/form-data with field name "image"
 * Returns: 201 + the created bill document (JSON)
 */
export const createBill = async (req, res, next) => {
  try {
    // --- Stage 1: Validate file is present ---
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided. Use form field name "image".',
      });
    }

    // --- Stage 2: Upload to Cloudinary ---
    console.log(`[pipeline] Uploading ${req.file.originalname} (${req.file.size} bytes) to Cloudinary...`);
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    console.log(`[pipeline] ✓ Cloudinary OK — ${uploadResult.url}`);

    // --- Stage 3: OCR via Google Cloud Vision ---
    console.log('[pipeline] Extracting text with Vision OCR...');
    const rawText = await extractTextFromImage(req.file.buffer);
    console.log(`[pipeline] ✓ Vision OK — ${rawText.length} chars extracted`);

    // --- Stage 4: AI classification via Cohere ---
    console.log('[pipeline] Classifying with Cohere...');
    const { title, amount, category } = await classifyBillData(rawText);
    console.log(`[pipeline] ✓ Cohere OK — "${title}" | ${amount} MMK | ${category}`);

    // --- Stage 4.5: Validate extracted data ---
    if (!amount || amount <= 0 || title === 'Unknown Bill') {
      // Clean up the Cloudinary upload — don't keep orphaned images
      try {
        await deleteFromCloudinary(uploadResult.publicId);
        console.log(`[pipeline] ✗ Cleaned up Cloudinary image: ${uploadResult.publicId}`);
      } catch (cleanupErr) {
        console.warn(`[pipeline] ⚠ Cleanup failed: ${cleanupErr.message}`);
      }

      const reason = !amount || amount <= 0
        ? 'No total amount could be detected in this image. Please upload a clearer bill or receipt that shows the price.'
        : 'This bill could not be identified. Please upload a clearer image of a utility bill or receipt.';

      return res.status(422).json({
        error: reason,
        code: 'UNRECOGNIZED_BILL',
        detail: { title, amount, category },
      });
    }

    // --- Stage 5: Save to MongoDB (scoped to user) ---
    const bill = await Bill.create({
      userId: req.userId,
      title,
      amount,
      category,
      imageUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      rawText,
    });
    console.log(`[pipeline] ✓ MongoDB OK — _id: ${bill._id} (user: ${req.userId})`);

    res.status(201).json(bill);
  } catch (err) {
    console.error('[pipeline] ✗ Failed:', err.message);
    next(err);
  }
};

/**
 * GET /api/bills?category=Electricity&year=2025&month=3
 *
 * Returns the authenticated user's bills, optionally filtered by category and/or date.
 * Sorted by newest first.
 */
export const getBills = async (req, res, next) => {
  try {
    const filter = { userId: new mongoose.Types.ObjectId(req.userId) };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.year) {
      const year = parseInt(req.query.year, 10);
      if (req.query.month) {
        const month = parseInt(req.query.month, 10);
        const start = new Date(Date.UTC(year, month - 1, 1));
        const end = new Date(Date.UTC(year, month, 1));
        filter.createdAt = { $gte: start, $lt: end };
      } else {
        const start = new Date(Date.UTC(year, 0, 1));
        const end = new Date(Date.UTC(year + 1, 0, 1));
        filter.createdAt = { $gte: start, $lt: end };
      }
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bills/months
 *
 * Returns distinct year-month pairs that have bills (for the current user), newest first.
 */
export const getAvailableMonths = async (req, res, next) => {
  try {
    const months = await Bill.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    const MONTH_LABELS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const result = months.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      label: `${MONTH_LABELS[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bills/stats
 *
 * Returns spending summary grouped by category (for the current user).
 */
export const getBillStats = async (req, res, next) => {
  try {
    const stats = await Bill.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/bills/:id
 *
 * Deletes a bill — ONLY if it belongs to the authenticated user.
 * Also removes the image from Cloudinary.
 */
export const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Clean up the image from Cloudinary if we have a publicId
    if (bill.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(bill.cloudinaryPublicId);
        console.log(`[pipeline] ✓ Deleted from Cloudinary: ${bill.cloudinaryPublicId}`);
      } catch (cloudErr) {
        console.warn(`[pipeline] ⚠ Could not delete Cloudinary image: ${cloudErr.message}`);
      }
    }

    res.json({ message: 'Bill deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
};
