const express = require('express');
const { 
  login, register, changePassword, 
  updateProfileSettings, listTeachers, setupAdmin, deleteAccount 
} = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/change-password', changePassword);
router.post('/update-profile', updateProfileSettings);
router.get('/teachers', listTeachers);
router.get('/setup-admin', setupAdmin);
router.delete('/delete/:userId', deleteAccount);

module.exports = router;
