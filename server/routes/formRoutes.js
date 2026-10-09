const express = require('express');
const {
  createForm, updateForm, deleteForm, listForms, getForm,
  submitForm, getMySubmissions, getFormSubmissions, reviewSubmission
} = require('../controllers/formController');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');

const router = express.Router();

const OFFICE = ['principal', 'admin'];
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, max: 30,
  message: 'Too many updates. Please slow down.'
});
const fillLimiter = rateLimit({
  windowMs: 60 * 1000, max: 6,
  message: 'You are submitting forms very quickly. Please wait a moment.'
});

router.use(authenticate);

router.get('/', asyncRoute(listForms));
router.get('/mine', asyncRoute(getMySubmissions));
router.post('/', authorize(...OFFICE), writeLimiter, asyncRoute(createForm));

router.get('/:id', asyncRoute(getForm));
router.patch('/:id', authorize(...OFFICE), writeLimiter, asyncRoute(updateForm));
router.delete('/:id', authorize(...OFFICE), writeLimiter, asyncRoute(deleteForm));
router.post('/:id/submit', authorize('student'), fillLimiter, asyncRoute(submitForm));
router.get('/:id/submissions', authorize(...OFFICE), asyncRoute(getFormSubmissions));

router.patch('/submissions/:id', authorize(...OFFICE), writeLimiter, asyncRoute(reviewSubmission));

module.exports = router;
