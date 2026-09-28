const express = require('express');
const {
  getClasses,
  getOutline,
  getBundle,
  getNotes,
  getQuestions,
  saveNote,
  removeNote,
  listOverrides
} = require('../controllers/studyController');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();

// ---- Public: ye school website ka openly readable hissa hai ----
router.get('/classes', getClasses);
router.get('/content', getBundle);
router.get('/outline', getOutline);
router.get('/notes', asyncRoute(getNotes));
router.get('/questions', getQuestions);

// ---- Sirf principal + admin manage kar sakte hain ----
router.use(authenticate, authorize('principal', 'admin'));
router.get('/overrides', asyncRoute(listOverrides));
router.post('/notes', rateLimit({ windowMs: 60 * 1000, max: 30 }), asyncRoute(saveNote));
router.delete('/notes/:id', asyncRoute(removeNote));

module.exports = router;
