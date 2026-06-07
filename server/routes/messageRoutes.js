const express = require('express');
const { saveMessage, getRoomMessages } = require('../controllers/messageController');
const router = express.Router();

router.post('/', saveMessage);
router.get('/:room', getRoomMessages);

module.exports = router;
