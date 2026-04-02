const express = require('express');
const router = express.Router();
const { signup, login, sendOTP, forgotPassword } = require('../controllers/authController');

router.post('/send-otp', sendOTP);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

module.exports = router;
