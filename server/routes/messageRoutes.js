const express = require('express');
const { saveMessage, getRoomMessages, deleteMessage } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();
const sendLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: 'You are sending messages too quickly.' });

router.use(authenticate);

router.post('/', sendLimiter, asyncRoute(saveMessage));
router.get('/:room', asyncRoute(getRoomMessages));
router.delete('/:id', asyncRoute(deleteMessage));

module.exports = router;
