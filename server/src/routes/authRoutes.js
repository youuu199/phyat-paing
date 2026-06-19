import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register — public
router.post('/register', register);

// POST /api/auth/login — public
router.post('/login', login);

// GET /api/auth/me — protected
router.get('/me', auth, getMe);

export default router;
