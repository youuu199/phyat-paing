import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /api/auth/register
 *
 * Body: { email, password }
 * Returns: { token, user: { email, createdAt } }
 *
 * Validation:
 *  - email must be present and look like an email
 *  - password must be at least 6 characters
 *  - email must not already be registered
 */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!email.includes('@') || email.length < 5) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    const token = makeToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 * Returns: { token, user: { email, createdAt } }
 *
 * Errors:
 *  - 401 if email not found or password doesn't match (same
 *    message for both to avoid user enumeration)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = makeToken(user._id.toString());

    res.json({
      token,
      user: {
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 *
 * Protected — requires valid JWT (handled by auth middleware).
 * Returns the currently authenticated user's info.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('email createdAt');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ email: user.email, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
};
