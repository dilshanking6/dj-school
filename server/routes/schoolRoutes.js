const express = require('express');
const {
  getDashboard, listUsers, updateUserStatus, markAttendance, getAttendance, getTodayAttendance,
  uploadResult, getResults, createEvent, getEvents, createAnnouncement,
  getAnnouncements, deleteAnnouncement, deleteEvent, getPortalStats
} = require('../controllers/schoolController');
const { createUserByOffice } = require('../controllers/authController');
const { getTopTeachers } = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();
const STAFF = ['teacher', 'principal', 'admin'];
const OFFICE = ['principal', 'admin'];
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 40, message: 'Too many updates. Please slow down.' });

/**
 * Landing page ke liye safe aggregate data — koi personal record nahi.
 * Ye yahan authenticate se pahle mount hota hai.
 */
const publicRouter = express.Router();
publicRouter.get('/portal-stats', rateLimit({ windowMs: 60 * 1000, max: 60 }), asyncRoute(getPortalStats));
publicRouter.get('/top-teachers', rateLimit({ windowMs: 60 * 1000, max: 60 }), asyncRoute(getTopTeachers));

router.use(authenticate);

router.get('/dashboard', asyncRoute(getDashboard));

router.get('/users', authorize(...STAFF), asyncRoute(listUsers));
router.post('/users', authorize('teacher', ...OFFICE), writeLimiter, asyncRoute(createUserByOffice));
router.patch('/users/:id', authorize(...OFFICE), writeLimiter, asyncRoute(updateUserStatus));

router.post('/attendance', authorize(...STAFF), writeLimiter, asyncRoute(markAttendance));
router.get('/attendance', asyncRoute(getAttendance));
router.get('/attendance/today', authorize(...STAFF), asyncRoute(getTodayAttendance));

router.post('/results', authorize(...STAFF), writeLimiter, asyncRoute(uploadResult));
router.get('/results', asyncRoute(getResults));

router.post('/events', authorize(...STAFF), writeLimiter, asyncRoute(createEvent));
router.get('/events', asyncRoute(getEvents));
router.delete('/events/:id', authorize(...STAFF), writeLimiter, asyncRoute(deleteEvent));

router.post('/announcements', authorize(...STAFF), writeLimiter, asyncRoute(createAnnouncement));
router.get('/announcements', asyncRoute(getAnnouncements));
router.delete('/announcements/:id', authorize(...STAFF), writeLimiter, asyncRoute(deleteAnnouncement));

module.exports = router;
module.exports.publicRouter = publicRouter;