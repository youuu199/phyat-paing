import { Router } from 'express';
import upload from '../middleware/upload.js';
import {
  createBill,
  getBills,
  getBillStats,
  getAvailableMonths,
  deleteBill,
} from '../controllers/billController.js';

const router = Router();

// POST   /api/bills           — Full pipeline: upload → OCR → AI → save
// GET    /api/bills           — List all bills (?category=&year=&month=)
// GET    /api/bills/months    — Distinct year-month pairs with bill counts
// GET    /api/bills/stats     — Spending summary by category
// DELETE /api/bills/:id       — Delete a bill

// IMPORTANT: /months and /stats must come BEFORE /:id to avoid route collision
router.post('/', upload.single('image'), createBill);
router.get('/', getBills);
router.get('/months', getAvailableMonths);
router.get('/stats', getBillStats);
router.delete('/:id', deleteBill);

export default router;
