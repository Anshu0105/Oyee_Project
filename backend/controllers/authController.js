const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { JWT_SECRET } = require('../middleware/auth');

// --- Aura name generator ---
const adjectives = ['Crimson', 'Midnight', 'Silent', 'Ghost', 'Void', 'Neon', 'Shadow', 'Cosmic', 'Phantom', 'Ember', 'Stellar', 'Dark', 'Radiant', 'Ancient', 'Frozen'];
const nouns = ['Thunder', 'Echo', 'Wanderer', 'Specter', 'Pulse', 'Signal', 'Drift', 'Storm', 'Cipher', 'Flame', 'Revenant', 'Nexus', 'Sovereign', 'Oracle', 'Wraith'];
const generateAuraName = () => `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

// --- Nodemailer ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOTPEmail = async (email, otpCode) => {
  const mailOptions = {
    from: `"OYEEE" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your OYEEE Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; background:#0a0a0a; color:#fff; padding:40px; border-radius:12px; border:1px solid #e91e63; max-width:500px; margin:0 auto;">
        <h1 style="color:#e91e63; text-align:center; font-size:32px; letter-spacing:4px; margin:0 0 8px;">OYEEE<span style="color:#fff;">.</span></h1>
        <p style="text-align:center; opacity:0.6; font-size:12px; margin:0 0 32px;">one door. infinite anonymity.</p>
        <p style="font-size:16px; text-align:center; opacity:0.8;">Your verification code to enter the void:</p>
        <div style="background:#1a1a1a; padding:24px; text-align:center; border-radius:8px; margin:24px 0;">
          <p style="font-size:48px; font-weight:bold; letter-spacing:12px; color:#fff; margin:0;">${otpCode}</p>
        </div>
        <p style="font-size:13px; text-align:center; opacity:0.5;">This code expires in 5 minutes. Do not share it.</p>
        <div style="margin-top:40px; border-top:1px solid #333; padding-top:20px; text-align:center;">
          <p style="font-size:11px; opacity:0.3;">OYEEE — one door. infinite anonymity.</p>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

// --- Send OTP (used for signup verification) ---
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, otpCode);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('sendOTP error:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- Sign Up ---
exports.signup = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // 1. Validate email domain
    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ error: 'This email is already registered. Please login instead.' });
    }

    // 3. Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }
    // Check 5 min expiry
    const otpAge = (Date.now() - new Date(otpRecord.createdAt).getTime()) / 1000;
    if (otpAge > 300) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Generate identity
    const auraName = generateAuraName();
    const username = `${auraName.replace(' ', '_').toLowerCase()}_${Math.random().toString(36).substring(2, 6)}`;

    // 6. Create or update user
    let user = existingUser;
    if (user) {
      user.password = passwordHash;
      user.emailVerified = true;
      user.auraName = auraName;
      user.username = username;
      await user.save();
    } else {
      user = await User.create({ email, password: passwordHash, username, auraName, emailVerified: true, authProvider: 'email' });
    }

    // 7. Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // 8. Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, auraName: user.auraName, email: user.email, avatarEmoji: user.avatarEmoji, spendableAura: user.spendableAura, lifetimeAura: user.lifetimeAura, maxLifetimeAura: user.maxLifetimeAura }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- Login ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user || !user.emailVerified) {
      return res.status(400).json({ error: 'No account found with this email. Please sign up first.' });
    }

    // 2. Compare password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(400).json({ error: 'Invalid credentials. Please check your password.' });
    }

    // 3. Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, auraName: user.auraName, email: user.email, avatarEmoji: user.avatarEmoji, spendableAura: user.spendableAura, lifetimeAura: user.lifetimeAura, maxLifetimeAura: user.maxLifetimeAura }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- Forgot Password (sends OTP to reset) ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate({ email }, { otp: otpCode, createdAt: new Date() }, { upsert: true, new: true });
    await sendOTPEmail(email, otpCode);

    res.status(200).json({ message: 'Password reset OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Kept for backward compatibility: initiateLogin (OTP-only, existing users) ---
exports.initiateLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only university emails are allowed.' });
    }

    const user = await User.findOne({ email });
    if (user && user.emailVerified) {
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '3d' });
      return res.status(200).json({ directLogin: true, token, user: { id: user._id, username: user.username, role: user.role, email: user.email } });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate({ email }, { otp: otpCode, createdAt: new Date() }, { upsert: true, new: true });
    if (!user) {
      await User.create({ username: `anon_${Math.random().toString(36).substring(7)}`, email, password: 'otp_auth', emailVerified: false });
    }
    await sendOTPEmail(email, otpCode);
    res.status(200).json({ directLogin: false, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('initiateLogin error:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- Kept for backward compatibility: verifyOTP ---
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP.' });

    const user = await User.findOneAndUpdate({ email }, { emailVerified: true }, { new: true });
    await OTP.deleteOne({ _id: otpRecord._id });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '3d' });
    res.status(200).json({ token, user: { id: user._id, username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
