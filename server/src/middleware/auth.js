import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Express middleware — verifies JWT from Authorization header.
 *
 * Expects: `Authorization: Bearer <token>`
 * On success: attaches `req.userId` (the user's MongoDB _id as string)
 * On failure: responds 401 with JSON error
 */
function auth(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfigured — JWT_SECRET not set' });
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.slice(7); // remove "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default auth;
