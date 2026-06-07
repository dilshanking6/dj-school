const express = require('express');
const { submitComplaint, getStudentComplaints, getAllComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const router = express.Router();

router.post('/', submitComplaint);
router.get('/student/:studentId', getStudentComplaints);
router.get('/all', getAllComplaints);
router.patch('/:id/status', updateComplaintStatus);

module.exports = router;
