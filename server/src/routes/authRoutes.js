import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, logout } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Rate limiter for auth endpoints — prevents brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register — public (rate limited)
router.post('/register', authLimiter, register);

// POST /api/auth/login — public (rate limited)
router.post('/login', authLimiter, login);

// GET /api/auth/me — protected
router.get('/me', auth, getMe);

// POST /api/auth/logout — clears auth cookie
router.post('/logout', logout);

export default router;
