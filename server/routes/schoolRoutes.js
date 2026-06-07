const express = require('express');
const {
  getDashboard,
  listUsers,
  updateUserStatus,
  markAttendance,
  getAttendance,
  uploadResult,
  getResults,
  createEvent,
  getEvents,
  createAnnouncement,
  getAnnouncements
} = require('../controllers/schoolController');

const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.post('/attendance', markAttendance);
router.get('/attendance', getAttendance);
router.post('/results', uploadResult);
router.get('/results', getResults);
router.post('/events', createEvent);
router.get('/events', getEvents);
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);

module.exports = router;
