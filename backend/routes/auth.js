const express = require('express');
const router = express.Router();
const { initiateLogin, verifyOTP } = require('../controllers/authController');

router.post('/initiate-login', initiateLogin);
router.post('/verify-otp', verifyOTP);

module.exports = router;
