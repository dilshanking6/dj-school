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
  getAnnouncements,
  deleteAnnouncement,
  deleteEvent,
  getPortalStats
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
router.delete('/events/:id', deleteEvent);
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);
router.get('/portal-stats', getPortalStats);

module.exports = router;
