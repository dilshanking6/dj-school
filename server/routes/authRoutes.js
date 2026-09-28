const express = require('express');
const {
  requestOtp, login, register, changePassword,
  updateProfile, listTeachers, deleteAccount
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many sign-in attempts. Try again in a few minutes.' });
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 6, message: 'Too many verification codes requested. Try again in a few minutes.' });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many accounts created from this network. Try again later.' });

router.post('/otp/request', otpLimiter, asyncRoute(requestOtp));
router.post('/login', loginLimiter, asyncRoute(login));
router.post('/register', registerLimiter, asyncRoute(register));

router.get('/teachers', asyncRoute(listTeachers));

router.post('/change-password', authenticate, asyncRoute(changePassword));
router.post('/update-profile', authenticate, asyncRoute(updateProfile));
router.delete('/account', authenticate, asyncRoute(deleteAccount));
router.delete('/delete/:userId', authenticate, authorize('admin'), asyncRoute(deleteAccount));

module.exports = router;
