const express = require('express');
const { listRooms, createRoom, joinRoom, listMembers } = require('../controllers/chatRoomController');

const router = express.Router();

router.get('/', listRooms);
router.post('/', createRoom);
router.post('/:id/join', joinRoom);
router.get('/:id/members', listMembers);

module.exports = router;
