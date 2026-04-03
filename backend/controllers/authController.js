const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { generateAuraName } = require('../utils/nameGenerator');

const emojis = ['🥭', '🍜', '🌮', '🍔', '🍕', '🍣', '🍩', '🥓', '🧇', '🥞', '🥨', '🌮', '🥑', '🍔', '🥟', '🥨'];

// Nodemailer transport - Hardened for Render + Gmail SSL
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL for more reliable delivery from cloud environments
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
});

// Temporary memory store for OTPs
const otpStore = new Map();

exports.sendOtp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(`[AUTH] Initiating Signup OTP for: ${email}`);
    
    const cguRegex = /^(22|23|24|25)\d{4}(0\d{3}|1\d{3}|2000)@cgu-odisha\.ac\.in$/;
    if (!cguRegex.test(email.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Access Denied: Please use your CGU Student Email (e.g., 2301020816@cgu-odisha.ac.in).' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Identity already manifested in the Void.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, {
      otp,
      expiresAt,
      userData: { username, email, password }
    });

    const mailOptions = {
      from: `"OYEEE Auth" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OYEEE Authentication Code',
      html: `
        <div style="background: #000; color: #fff; padding: 30px; border-radius: 20px; border: 1px solid #FF0055; font-family: sans-serif;">
          <h2 style="color: #FF0055; letter-spacing: 2px;">WELCOME TO THE VOID</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 2.5rem; font-weight: 900; letter-spacing: 5px; color: #fff; margin: 20px 0;">${otp}</div>
          <p style="opacity: 0.5;">This code expires in 5 minutes. Secure your identity.</p>
        </div>
      `
    };

    console.log(`[SMTP] Attempting to transmit Signup OTP to: ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Signup OTP successfully transmitted.`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(`[SMTP ERROR] Signup failed: ${err.message}`);
    res.status(500).json({ error: `SMTP Transmission Failure: ${err.message}` });
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
    console.log(`[RECOVERY] Requesting reset for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[RECOVERY] Identity not found: ${email}`);
      return res.status(404).json({ error: 'This identity does not exist in our records.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt, type: 'reset' });

    const mailOptions = {
      from: `"OYEEE Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Recover Your OYEEE Identity',
      html: `
        <div style="background: #000; color: #fff; padding: 30px; border-radius: 20px; border: 1px solid #FF0055; font-family: sans-serif;">
            <h2 style="color: #FF0055; letter-spacing: 2px;">IDENTITY RECOVERY</h2>
            <p>A recovery signal was initiated for your OYEEE profile. If this was you, use the code below to reset your credentials:</p>
            <div style="font-size: 2.5rem; font-weight: 900; letter-spacing: 5px; color: #fff; margin: 25px 0; text-align: center;">${otp}</div>
            <p style="opacity: 0.5; font-size: 0.8rem;">This authentication code expires in 5 minutes.</p>
            <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;"></div>
            <p style="font-size: 0.7rem; opacity: 0.3;">OYEEE PROTOCOL // ENCRYPTED RECOVERY SIGNAL</p>
        </div>
      `
    };

    console.log(`[SMTP] Transmitting recovery signal to: ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Recovery signal successfully transmitted.`);
    res.json({ message: 'Recovery code sent successfully.' });
  } catch (err) {
    console.error(`[SMTP ERROR] Recovery failed: ${err.message}`);
    res.status(500).json({ error: `Connection to the Mail Hub timed out. Verify your Void settings. Details: ${err.message}` });
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
