import Bill from '../models/Bill.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryStorage.js';
import { extractTextFromImage } from '../utils/ocrService.js';
import { classifyBillData } from '../utils/geminiService.js';

/**
 * POST /api/bills
 *
 * Full pipeline: upload image → Firebase → Vision OCR → Gemini AI → MongoDB.
 *
 * Expects: multipart/form-data with field name "image"
 * Returns: 201 + the created bill document (JSON)
 *
 * Pipeline:
 *   1. Multer (handled by route middleware) → req.file.buffer
 *   2. uploadToFirebase()            → imageUrl
 *   3. extractTextFromImage()        → rawText
 *   4. classifyBillData(rawText)     → { title, amount, category }
 *   5. Bill.create({...})           → MongoDB document
 */
export const createBill = async (req, res, next) => {
  try {
    // --- Stage 1: Validate file is present (multer already processed it) ---
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

    // --- Stage 4: AI classification via Gemini 2.5 ---
    console.log('[pipeline] Classifying with Gemini 2.5...');
    const { title, amount, category } = await classifyBillData(rawText);
    console.log(`[pipeline] ✓ Gemini OK — "${title}" | ${amount} MMK | ${category}`);

    // --- Stage 5: Save to MongoDB ---
    const bill = await Bill.create({
      title,
      amount,
      category,
      imageUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      rawText,
    });
    console.log(`[pipeline] ✓ MongoDB OK — _id: ${bill._id}`);

    res.status(201).json(bill);
  } catch (err) {
    console.error('[pipeline] ✗ Failed:', err.message);
    next(err);
  }
};

/**
 * GET /api/bills?category=Electricity&year=2025&month=3
 *
 * Returns all bills, optionally filtered by category and/or date.
 *   - category: one of the 6 bill categories
 *   - year:    4-digit year (e.g. 2025) — filters to that calendar year
 *   - month:   1–12 numeric month — only used when year is also set;
 *              filters to that specific year-month
 * Sorted by newest first (descending createdAt).
 */
export const getBills = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.year) {
      const year = parseInt(req.query.year, 10);
      if (req.query.month) {
        // Filter to a specific year-month
        const month = parseInt(req.query.month, 10);
        const start = new Date(Date.UTC(year, month - 1, 1));
        const end = new Date(Date.UTC(year, month, 1));
        filter.createdAt = { $gte: start, $lt: end };
      } else {
        // Filter to the entire calendar year
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
 * Returns distinct year-month pairs that have bills, newest first.
 * Used by the sidebar to show available months for filtering.
 *
 * Response: [{ year: 2025, month: 3, label: "March 2025", count: 4 }, ...]
 */
export const getAvailableMonths = async (req, res, next) => {
  try {
    const months = await Bill.aggregate([
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
 * Returns spending summary grouped by category.
 * Response: [{ _id: "Electricity", total: 57000, count: 2 }, ...]
 */
export const getBillStats = async (req, res, next) => {
  try {
    const stats = await Bill.aggregate([
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
 * Deletes a bill document from MongoDB AND its image from Cloudinary.
 */
export const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Clean up the image from Cloudinary if we have a publicId
    if (bill.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(bill.cloudinaryPublicId);
        console.log(`[pipeline] ✓ Deleted from Cloudinary: ${bill.cloudinaryPublicId}`);
      } catch (cloudErr) {
        // Don't fail the request if Cloudinary deletion fails — the bill is already gone
        console.warn(`[pipeline] ⚠ Could not delete Cloudinary image: ${cloudErr.message}`);
      }
    }

    res.json({ message: 'Bill deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
};
