const express = require('express');
const router = express.Router();
const { signup, login, sendOTP, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/send-otp', sendOTP);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
