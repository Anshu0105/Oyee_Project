const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { generateAuraName } = require('../utils/nameGenerator');

const emojis = ['🥭', '🍜', '🌮', '🍔', '🍕', '🍣', '🍩', '🥓', '🧇', '🥞', '🥨', '🌮', '🥑', '🍔', '🥟', '🥨'];

// Nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Temporary memory store for OTPs
// Structure: Map<email, { otp, expiresAt, userData }>
const otpStore = new Map();

exports.sendOtp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Institutional Domain & Registration Logic (CGU Odisha)
    const cguRegex = /^(22|23|24|25)\d{4}(0\d{3}|1\d{3}|2000)@cgu-odisha\.ac\.in$/;
    
    if (!cguRegex.test(email.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Access Denied: Please use a valid CGU Student Email (e.g., 2301020816@cgu-odisha.ac.in) from active batches (2022-2025).' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStore.set(email, {
      otp,
      expiresAt,
      userData: { username, email, password }
    });

    const mailOptions = {
      from: `"OYEEE Auth" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OYEEE Authentication Code',
      text: `Your OTP for OYEEE is: ${otp}. It expires in 5 minutes.`,
      html: `<h2>Welcome to OYEEE</h2><p>Your 6-digit verification code is: <strong>${otp}</strong></p><p>It expires in 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const storedData = otpStore.get(email);
    if (!storedData) return res.status(400).json({ error: 'OTP request expired or never manifested.' });

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'Code has returned to the Void (Expired).' });
    }

    if (storedData.otp !== otp) return res.status(400).json({ error: 'Invalid authentication signal.' });

    const { username, password } = storedData.userData;
    otpStore.delete(email);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const auraName = await generateAuraName();
    const avatarEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const auraColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    const newUser = new User({
      username, email, password: hashedPassword, auraName, avatarEmoji, auraColor, role: 'user'
    });

    const savedUser = await newUser.save();
    
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, JWT_SECRET, { expiresIn: '3d' });

    res.status(201).json({ 
      message: `Identity manifest complete, ${auraName}!`,
      token,
      user: {
          id: savedUser._id, username: savedUser.username, auraName, auraPoints: 0,
          avatarEmoji, auraColor, role: savedUser.role, theme: 'wine'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '3d' });

    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, username: user.username, role: user.role, email: user.email, 
        auraName: user.auraName, auraPoints: user.aura, avatarEmoji: user.avatarEmoji, 
        auraColor: user.auraColor, theme: user.theme || 'wine', claimedItems: user.claimedItems || []
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Identity not found in the Void' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt, type: 'reset' });

    const mailOptions = {
      from: `"OYEEE Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your OYEEE Password',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #000; color: #fff; border-radius: 12px; border: 1px solid #FF0055;">
          <h2 style="color: #FF0055;">Password Reset Request</h2>
          <p>You requested a password reset for your OYEEE account.</p>
          <p>Your authentication code is: <strong style="font-size: 1.5rem; letter-spacing: 2px;">${otp}</strong></p>
          <p>This code expires in 5 minutes.</p>
          <p style="font-size: 0.8rem; opacity: 0.5;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Reset code sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData || storedData.type !== 'reset') {
      return res.status(400).json({ error: 'Reset session not found' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'Code expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    otpStore.delete(email);

    res.json({ message: 'Password updated successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
