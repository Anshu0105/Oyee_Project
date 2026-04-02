const express = require('express');
const router = express.Router();
const { initiateLogin, verifyOTP, signup, login, sendOTP, forgotPassword } = require('../controllers/authController');

// New password-based auth
router.post('/send-otp', sendOTP);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Legacy OTP-only flow (kept for backward compatibility)
router.post('/initiate-login', initiateLogin);
router.post('/verify-otp', verifyOTP);

module.exports = router;
