const express = require('express');
const router = express.Router();
const { register, login, getProfile, requestEmailOTP, verifyEmailOTP } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestEmailOTP);
router.post('/verify-otp', verifyEmailOTP);
router.get('/profile', authenticate, getProfile);

module.exports = router;
