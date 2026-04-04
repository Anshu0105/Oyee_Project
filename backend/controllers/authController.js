const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { Resend } = require('resend');
const { generateAuraName } = require('../utils/nameGenerator');

const emojis = ['🥭', '🍜', '🌮', '🍔', '🍕', '🍣', '🍩', '🥓', '🧇', '🥞', '🥨', '🌮', '🥑', '🍔', '🥟', '🥨'];

// Resend HTTPS Email Gateway — bypasses all SMTP port/IPv6 blocking on cloud
const resend = new Resend(process.env.RESEND_API_KEY);


// Temporary memory store for OTP manifestations
const otpStore = new Map();

exports.sendOtp = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Strict CGU Odisha Institutional Rule (Batches 2022-2025)
    const cguRegex = /^(22|23|24|25)\d{4}(0\d{3}|1\d{3}|2000)@cgu-odisha\.ac\.in$/;
    
    if (!cguRegex.test(email.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Manifest Rejected: Please use a valid CGU Student Email (e.g., 2301020816@cgu-odisha.ac.in).' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: 'Identity already manifested in the Void.' });

    // Generate 6-digit manifest code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min window

    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      userData: { email: email.toLowerCase(), password }
    });

    const { error: sendError } = await resend.emails.send({
      from: 'OYEEE Auth <noreply@oyeee.chat>',
      to: [email],
      subject: 'Your OYEEE Authentication Code',
      html: `
        <div style="background: #000; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid #FF0055; font-family: sans-serif;">
          <h2 style="color: #FF0055; letter-spacing: 2px; text-transform: uppercase;">Identity Manifest Protocol</h2>
          <p>A signup signal was initiated for OYEEE. Use the code below to manifest your existence:</p>
          <div style="font-size: 3rem; font-weight: 900; letter-spacing: 5px; color: #fff; margin: 30px 0; text-align: center;">${otp}</div>
          <p style="opacity: 0.5;">This manifestation signal expires in 10 minutes. Secure your identity.</p>
        </div>
      `
    });

    if (sendError) {
      return res.status(500).json({ error: `Email delivery failed: ${sendError.message}` });
    }

    res.status(200).json({ message: 'Frequency signal transmitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: `OTP system error: ${err.message}` });
  }
};

exports.verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData) return res.status(400).json({ error: 'Manifest signal lost or expired. Request a new code.' });
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: 'Signal expired.' });
    }
    if (storedData.otp !== otp) return res.status(400).json({ error: 'Incorrect manifestation code.' });

    const { password } = storedData.userData;
    otpStore.delete(email.toLowerCase());

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Dynamic Identity Synthesis
    const auraName = await generateAuraName();
    const avatarEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const auraColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    const newUser = new User({
      username: email.toLowerCase().split('@')[0], 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      auraName, 
      avatarEmoji, 
      auraColor, 
      role: 'user'
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, JWT_SECRET, { expiresIn: '3d' });

    res.status(201).json({ 
      message: `Identity complete, ${auraName}!`,
      token,
      user: {
          id: savedUser._id, auraName, auraPoints: 0,
          avatarEmoji, auraColor, role: 'user', theme: 'wine'
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
