const express = require('express');
const { saveMessage, getRoomMessages, deleteMessage } = require('../controllers/messageController');
const router = express.Router();

router.post('/', saveMessage);
router.get('/:room', getRoomMessages);
router.delete('/:id', deleteMessage);

module.exports = router;
