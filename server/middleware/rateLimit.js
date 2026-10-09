const { HttpError } = require('./auth');

const buckets = new Map();

const setIntervalCleanup = () => {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 60 * 1000);
  timer.unref();
  return timer;
};

setIntervalCleanup();

const clientKey = (req) => {
  // Cloudflare har request par ye header khud set karta hai — client ise
  // chhoo nahi sakta, isliye sabse bharosemand key yahi hai.
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return String(cf).split(',')[0].trim();

  // `trust proxy` true hone ki wajah se `req.ip` already XFF se nikla hua
  // client hai.
  if (req.ip) return req.ip;

  // Fallback: purana behaviour. Iska pehla value client khud bhi bhej sakta
  // hai (XFF spoofing) — isliye ye aakhri option hai.
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
};

const rateLimit = ({ windowMs = 60 * 1000, max = 60, message } = {}) => (req, res, next) => {
  const key = `${req.method}:${req.baseUrl}${req.path}:${clientKey(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  bucket.count += 1;

  if (bucket.count > max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return next(new HttpError(429, message || `Too many requests. Try again in ${retryAfter} seconds.`));
  }

  return next();
};

module.exports = { rateLimit };
