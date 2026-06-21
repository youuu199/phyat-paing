import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import {
  createBill,
  getBills,
  getBillStats,
  getBillTrends,
  getAvailableMonths,
  getUpcomingBills,
  togglePayment,
  setRecurring,
  updateBill,
  deleteBill,
  exportBills,
} from '../controllers/billController.js';

const router = Router();

// All bill routes require authentication
router.use(auth);

// Rate limiter for bill creation — prevents pipeline abuse
const billCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 bill creations per minute per IP
  message: { error: 'Too many uploads, please wait before trying again' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST   /api/bills           — Full pipeline: upload → OCR → AI → save
// GET    /api/bills           — List user's bills (?category=&year=&month=)
// GET    /api/bills/months    — Distinct year-month pairs for user
// GET    /api/bills/stats     — Spending summary for user
// GET    /api/bills/trends    — Monthly spending totals (?months=12)
// PATCH  /api/bills/:id       — Update a bill (owned by user)
// DELETE /api/bills/:id       — Delete a bill (owned by user)

// IMPORTANT: /months, /stats, /trends, /upcoming, /export must come BEFORE /:id to avoid route collision
router.post('/', billCreateLimiter, upload.single('image'), createBill);
router.get('/', getBills);
router.get('/months', getAvailableMonths);
router.get('/stats', getBillStats);
router.get('/trends', getBillTrends);
router.get('/upcoming', getUpcomingBills);
router.get('/export', exportBills);
router.patch('/:id/payment', togglePayment);
router.post('/:id/recurring', setRecurring);
router.patch('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router;
