const express = require('express');
const {
  listRooms, createRoom, joinRoom, listMembers, deleteRoom, listDirectory
} = require('../controllers/chatRoomController');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();
const STAFF = ['teacher', 'principal', 'admin'];

router.use(authenticate);

router.get('/directory', rateLimit({ windowMs: 60 * 1000, max: 60 }), asyncRoute(listDirectory));
router.get('/', asyncRoute(listRooms));
router.post('/', rateLimit({ windowMs: 60 * 1000, max: 15 }), asyncRoute(createRoom));
router.post('/:id/join', rateLimit({ windowMs: 60 * 1000, max: 30 }), asyncRoute(joinRoom));
router.get('/:id/members', asyncRoute(listMembers));
router.delete('/:id', authorize(...STAFF), asyncRoute(deleteRoom));

module.exports = router;
