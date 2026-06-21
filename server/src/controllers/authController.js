import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Set httpOnly cookie with JWT token.
 * More secure than localStorage — JavaScript cannot access httpOnly cookies,
 * so XSS attacks cannot steal the token.
 */
function setTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * POST /api/auth/register
 *
 * Body: { email, password }
 * Returns: { token, user: { email, createdAt } }
 *
 * Validation:
 *  - email must be present and look like an email
 *  - password must be at least 8 characters with at least one number
 *  - email must not already be registered
 */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
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

    // Set httpOnly cookie
    setTokenCookie(res, token);

    res.status(201).json({
      token, // Also send in body for backward compatibility
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
 *  - 423 if account is locked due to too many failed attempts
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

    // Check if account is locked
    if (user.isLocked()) {
      const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        error: `Account locked due to too many failed attempts. Try again in ${lockMinutes} minutes.`,
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      // Increment failed attempts
      await user.incrementLoginAttempts();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    const token = makeToken(user._id.toString());

    // Set httpOnly cookie
    setTokenCookie(res, token);

    res.json({
      token, // Also send in body for backward compatibility
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

/**
 * POST /api/auth/logout
 *
 * Clears the httpOnly auth cookie.
 */
export const logout = async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out successfully' });
};
