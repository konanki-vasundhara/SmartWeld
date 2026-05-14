const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, requestEmailOTP, verifyEmailOTP } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestEmailOTP);
router.post('/verify-otp', verifyEmailOTP);
router.get('/profile', authenticate, getProfile);
router.put('/profile/update', authenticate, updateProfile);

module.exports = router;
