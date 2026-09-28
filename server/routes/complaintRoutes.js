const express = require('express');
const { submitComplaint, getStudentComplaints, getAllComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('student'), rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'You have sent several complaints already. Please wait before sending more.' }), asyncRoute(submitComplaint));
router.get('/student/:studentId', asyncRoute(getStudentComplaints));
router.get('/all', authorize('principal', 'admin'), asyncRoute(getAllComplaints));
router.patch('/:id/status', authorize('principal', 'admin'), asyncRoute(updateComplaintStatus));

module.exports = router;
