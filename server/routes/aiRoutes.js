// ============================================================
//  AI TUTOR ROUTES
//  Guests bhi puchh sakte hain (website par badge dikhta hai),
//  par rate limit user ya IP dono par lagti hai.
// ============================================================

const express = require('express');
const asyncRoute = require('../utils/asyncRoute');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { ask, capabilities, providerEnabled } = require('../utils/aiTutor');
const { isValidClass } = require('../utils/studyContent');

const router = express.Router();

const readMessage = (body) => {
  const value = String(body?.message ?? body?.text ?? '').trim();
  if (!value) {
    const error = new Error('Message is empty');
    error.status = 400;
    throw error;
  }
  if (value.length > 2000) {
    const error = new Error('Message is too long');
    error.status = 400;
    throw error;
  }
  return value;
};

const readHistory = (body) => {
  const list = body?.history;
  if (!Array.isArray(list)) return [];
  return list
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
};

/** Guest ke liye class guess nahi kar sakte — default 10. */
const readClass = (body, user) => {
  if (isValidClass(body?.class)) return Number(body.class);
  if (isValidClass(user?.class)) return Number(user.class);
  return null;
};

router.get(
  '/capabilities',
  asyncRoute(async (req, res) => {
    res.json({
      ...capabilities(),
      providerConfigured: providerEnabled(),
      // Batate hain ki free-form chat ke liye kya chahiye
      hint: providerEnabled()
        ? null
        : 'Free-form conversation ke liye server/.env me AI_API_KEY set karo. Tabhi ye ChatGPT jaisi open baatein kar sakti hai.'
    });
  })
);

router.post(
  '/chat',
  rateLimit({ windowMs: 60 * 1000, max: Number(process.env.AI_HTTP_RATE_MAX || 30) }),
  optionalAuth,
  asyncRoute(async (req, res) => {
    const message = readMessage(req.body);
    const history = readHistory(req.body);
    const classNo = readClass(req.body, req.user);
    const ip = req.ip || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || null;
    const result = await ask({ message, history, user: req.user || null, classNo, ip });

    res.json({
      reply: result.reply,
      mode: result.mode,
      subject: result.subject,
      class: result.class,
      answer: result.answer,
      ...(result.degraded ? { degraded: true } : {})
    });
  })
);

// Chat history server par nahi rakh-te — stateless. Ye sirf
// authenticated users ke liye class-scoped search deta hai.
router.get(
  '/search',
  authenticate,
  asyncRoute(async (req, res) => {
    const { searchIndex } = require('../utils/studyContent');
    const q = String(req.query.q || '').trim().toLowerCase();
    if (q.length < 2) return res.json({ results: [] });
    const classNo = isValidClass(req.query.class)
      ? Number(req.query.class)
      : isValidClass(req.user.class)
        ? Number(req.user.class)
        : 10;

    const results = searchIndex(classNo)
      .filter((row) => {
        const hay = `${row.title} ${row.keywords.join(' ')} ${row.subjectName}`.toLowerCase();
        return q.split(/\s+/).some((word) => word.length > 2 && hay.includes(word));
      })
      .slice(0, 25)
      .map((row) => ({
        subject: row.subject,
        subjectName: row.subjectName,
        title: row.title,
        class: row.class
      }));

    res.json({ results });
  })
);

module.exports = router;
