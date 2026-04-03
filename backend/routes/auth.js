const express = require('express');
const router = express.Router();
const { sendOtp, verifySignup, loginUser } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/verify-signup', verifySignup);
router.post('/login', loginUser);

module.exports = router;
