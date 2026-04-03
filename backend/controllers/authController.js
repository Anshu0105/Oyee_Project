const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const adjectives = ['Crunchy', 'Spicy', 'Sweet', 'Salty', 'Zesty', 'Tangy', 'Savory', 'Crispy', 'Roasted', 'Fried'];
const foods = ['Mango', 'Noodle', 'Taco', 'Burger', 'Pizza', 'Sushi', 'Donut', 'Bacon', 'Waffle', 'Pancake'];
const emojis = ['🥭', '🍜', '🌮', '🍔', '🍕', '🍣', '🍩', '🥓', '🧇', '🥞'];

function generateAura() {
  const adIdx = Math.floor(Math.random() * adjectives.length);
  const fdIdx = Math.floor(Math.random() * foods.length);
  const color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  return {
    auraName: `${adjectives[adIdx]} ${foods[fdIdx]}`,
    avatarEmoji: emojis[fdIdx],
    auraColor: color
  };
}

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
    
    // Domain restrict
    if (!email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Please use your university email (@cgu-odisha.ac.in)' });
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
    if (!storedData) {
      return res.status(400).json({ error: 'OTP request not found or expired' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const { username, password } = storedData.userData;
    
    // Clear OTP
    otpStore.delete(email);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Ensure unique aura name
    let auraData = generateAura();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const exists = await User.findOne({ auraName: auraData.auraName });
      if (!exists) {
        isUnique = true;
      } else {
        auraData = generateAura();
        // Append a random number to guarantee uniqueness if collisions happen
        auraData.auraName += ` ${Math.floor(Math.random() * 99)}`;
        attempts++;
      }
    }

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      ...auraData
    });

    const savedUser = await newUser.save();
    
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(201).json({ 
      message: 'User created successfully', 
      token,
      user: { id: savedUser._id, username: savedUser.username, role: savedUser.role, email: savedUser.email, auraName: savedUser.auraName, avatarEmoji: savedUser.avatarEmoji, auraColor: savedUser.auraColor } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' }); // intentionally generic error

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({ token, user: { id: user._id, username: user.username, role: user.role, email: user.email, auraName: user.auraName, avatarEmoji: user.avatarEmoji, auraColor: user.auraColor } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
