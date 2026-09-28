const jwt = require('jsonwebtoken');

const ROLES = ['student', 'teacher', 'principal', 'admin'];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const signToken = (user) =>
  jwt.sign(
    { id: String(user.id), role: user.role, class: user.class || 'N/A' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d', issuer: 'digital-janta' }
  );

const readToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

const verify = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new HttpError(500, 'Server authentication is not configured');
  }
  return jwt.verify(token, process.env.JWT_SECRET, { issuer: 'digital-janta' });
};

const sessionUser = (payload) => ({
  id: String(payload.id),
  role: payload.role,
  class: payload.class || 'N/A'
});

/**
 * Purane tokens me `class` claim nahi tha. Students ke liye class missing
 * matlab unverified scope — unhe force re-login karwao, warna 'N/A' se
 * kisi bhi class ka data dekh sakte hain. Staff ke liye class optional hai.
 */
const isLegacySession = (payload) =>
  !payload.class && ['student', 'teacher'].includes(payload.role);

const legacyMessage = 'Your session is from an older version. Please sign in again.';

const authenticate = (req, res, next) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const payload = verify(token);
    if (!payload.id || !ROLES.includes(payload.role)) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    if (isLegacySession(payload)) {
      return res.status(401).json({ error: legacyMessage });
    }
    req.user = sessionUser(payload);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired, please sign in again' });
    }
    return res.status(401).json({ error: 'Invalid session' });
  }
};

/**
 * Guest bhi puchh sake, par token ho to user mile.
 * AI tutor website par openly available hai.
 */
const optionalAuth = (req, res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = verify(token);
    if (payload.id && ROLES.includes(payload.role) && !isLegacySession(payload)) {
      req.user = sessionUser(payload);
    }
  } catch {
    // Invalid token par guest treat karo — reject nahi
  }
  return next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have access to this resource' });
  }
  return next();
};

const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const target = String(req.params.id || req.params.studentId || req.params.userId || '');
  if (req.user.role === 'admin' || req.user.id === target) return next();
  return res.status(403).json({ error: 'You do not have access to this resource' });
};

const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    const payload = verify(String(token));
    if (!payload.id || !ROLES.includes(payload.role)) return next(new Error('Invalid session'));
    if (isLegacySession(payload)) return next(new Error(legacyMessage));
    socket.user = sessionUser(payload);
    return next();
  } catch {
    return next(new Error('Invalid session'));
  }
};

module.exports = {
  ROLES,
  HttpError,
  signToken,
  authenticate,
  optionalAuth,
  authorize,
  requireSelfOrAdmin,
  authenticateSocket
};
