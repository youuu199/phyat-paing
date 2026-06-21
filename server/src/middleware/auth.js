import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Express middleware — verifies JWT from httpOnly cookie or Authorization header.
 *
 * Checks in order:
 *  1. httpOnly cookie named "token"
 *  2. Authorization header: `Bearer <token>`
 *
 * On success: attaches `req.userId` (the user's MongoDB _id as string)
 * On failure: responds 401 with JSON error
 */
function auth(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfigured — JWT_SECRET not set' });
  }

  // Try httpOnly cookie first, then Authorization header
  const token = req.cookies?.token || (() => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      return header.slice(7);
    }
    return null;
  })();

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default auth;
