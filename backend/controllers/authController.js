const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { JWT_SECRET } = require('../middleware/auth');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.initiateLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only university emails are allowed.' });
    }

    const user = await User.findOne({ email });
    
    // If user exists and is already verified, allow direct login (per requirement)
    if (user && user.emailVerified) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '3d' }
      );
      return res.status(200).json({ 
        directLogin: true, 
        token, 
        user: { id: user._id, username: user.username, role: user.role, email: user.email } 
      });
    }

    // New user or unverified user - Send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in DB
    await OTP.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Create user if doesn't exist (initial state for new users)
    if (!user) {
      const newUser = new User({
        username: `anon_${Math.random().toString(36).substring(7)}`,
        email,
        password: 'temporary_password', // OTP is the real auth
        emailVerified: false
      });
      await newUser.save();
    }

    // Send Email
    const mailOptions = {
      from: `"OYEEE Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OYEEE Verification Code',
      text: `Your 6-digit verification code is: ${otpCode}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e91e63;">
          <h1 style="color: #e91e63; text-align: center; font-size: 32px; letter-spacing: 4px;">OYEEE<span style="color: #ffffff;">.</span></h1>
          <p style="font-size: 18px; text-align: center; opacity: 0.8;">Your verification code to enter the void:</p>
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <p style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #ffffff; margin: 0;">${otpCode}</p>
          </div>
          <p style="font-size: 14px; text-align: center; opacity: 0.6;">This code will expire in 5 minutes.</p>
          <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; opacity: 0.4;">OYEEE - one door. infinite anonymity.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ directLogin: false, message: 'OTP sent to your email.' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true }
    );

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({ 
      token, 
      user: { id: user._id, username: user.username, role: user.role, email: user.email } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
