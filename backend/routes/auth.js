const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { sendOtp, verifySignup, loginUser, requestPasswordReset, resetPassword } = require('../controllers/authController');

const JWT_SECRET = process.env.JWT_SECRET || 'oyeee_secret_key';
const FRONTEND_URL = (process.env.NODE_ENV === 'production') 
  ? 'https://oyeee.chat' 
  : 'http://localhost:3000';

router.post('/send-otp', sendOtp);
router.post('/verify-signup', verifySignup);
router.post('/login', loginUser);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Google OAuth Initiation
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      JWT_SECRET,
      { expiresIn: '3d' }
    );

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth-success?token=${token}`);
  }
);

module.exports = router;
