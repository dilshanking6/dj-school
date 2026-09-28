const express = require('express');
const { submitRating, getTopTeachers } = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();

router.get('/top', authenticate, asyncRoute(getTopTeachers));
router.post('/', authenticate, authorize('student'), asyncRoute(submitRating));

module.exports = router;
