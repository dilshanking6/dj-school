const express = require('express');
const { shareNote, getNotesByClass, deleteNote, getAllNotes } = require('../controllers/noteController');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();
const STAFF = ['teacher', 'principal', 'admin'];

router.use(authenticate);

router.get('/all', authorize(...STAFF), asyncRoute(getAllNotes));
router.get('/class/:className', asyncRoute(getNotesByClass));
router.post('/', authorize('teacher', 'principal', 'admin'), rateLimit({ windowMs: 60 * 1000, max: 20 }), asyncRoute(shareNote));
router.delete('/:id', authorize('teacher', 'principal', 'admin'), asyncRoute(deleteNote));

module.exports = router;
