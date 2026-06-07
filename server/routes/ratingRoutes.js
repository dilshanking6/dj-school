const express = require('express');
const { submitRating, getTopTeachers } = require('../controllers/ratingController');
const router = express.Router();

router.post('/', submitRating);
router.get('/top', getTopTeachers);

module.exports = router;
