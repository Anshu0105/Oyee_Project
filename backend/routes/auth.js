const express = require('express');
const router = express.Router();
const { sendOtp, verifySignup, loginUser, requestPasswordReset, resetPassword } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/verify-signup', verifySignup);
router.post('/login', loginUser);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
