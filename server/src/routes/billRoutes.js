import { Router } from 'express';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import {
  createBill,
  getBills,
  getBillStats,
  getAvailableMonths,
  deleteBill,
} from '../controllers/billController.js';

const router = Router();

// All bill routes require authentication
router.use(auth);

// POST   /api/bills           — Full pipeline: upload → OCR → AI → save
// GET    /api/bills           — List user's bills (?category=&year=&month=)
// GET    /api/bills/months    — Distinct year-month pairs for user
// GET    /api/bills/stats     — Spending summary for user
// DELETE /api/bills/:id       — Delete a bill (owned by user)

// IMPORTANT: /months and /stats must come BEFORE /:id to avoid route collision
router.post('/', upload.single('image'), createBill);
router.get('/', getBills);
router.get('/months', getAvailableMonths);
router.get('/stats', getBillStats);
router.delete('/:id', deleteBill);

export default router;
