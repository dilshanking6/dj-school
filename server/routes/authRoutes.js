const express = require('express');
const { 
  login, register, changePassword, 
  updateProfileSettings, listTeachers, setupAdmin 
} = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/change-password', changePassword);
router.post('/update-profile', updateProfileSettings);
router.post('/list-teachers', listTeachers);
router.get('/setup-admin', setupAdmin);

module.exports = router;
