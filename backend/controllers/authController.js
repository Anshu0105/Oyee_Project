const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { JWT_SECRET } = require('../middleware/auth');

// ─── FOOD-BASED AURA NAME GENERATOR ──────────────────────────────────────────

const ADJECTIVES = [
  'Slime', 'Zinger', 'Smoky', 'Caramel', 'Tangy', 'Crispy',
  'Fizzy', 'Spicy', 'Buttery', 'Crunchy', 'Minty', 'Cheesy',
  'Salty', 'Sweet', 'Sour', 'Savory', 'Juicy', 'Creamy',
  'Fluffy', 'Sticky', 'Melted', 'Frozen', 'Roasted', 'Grilled',
  'Fried', 'Baked', 'Steamed', 'Golden', 'Silver', 'Neon',
  'Glowing', 'Dark', 'Hot', 'Cold', 'Warm', 'Cool',
  'Spooky', 'Mystic', 'Cosmic', 'Electric', 'Thunder', 'Cloud',
  'Midnight', 'Dawn', 'Sunset', 'Twilight', 'Silent', 'Wild',
  'Fierce', 'Bold', 'Tiny', 'Giant', 'Mini', 'Mega',
  'Super', 'Ultra', 'Blazing', 'Chilly', 'Velvet', 'Rustic',
  'Crisp', 'Zesty', 'Punchy', 'Saucy', 'Loaded', 'Toasty'
];

const FOOD_ITEMS = [
  'Lime', 'Corn', 'Popcorn', 'Taco', 'Waffle', 'Soda',
  'Noodle', 'Toast', 'Mango', 'Pizza', 'Burger', 'Fries',
  'Donut', 'Cookie', 'Cake', 'Brownie', 'Muffin', 'Bagel',
  'Pretzel', 'Nacho', 'Salsa', 'Rice', 'Pasta', 'Ramen',
  'Sushi', 'Kimchi', 'Curry', 'Biryani', 'Samosa', 'Pakora',
  'Dosa', 'Chaat', 'Momos', 'Dumpling', 'Sandwich', 'Wrap',
  'Burrito', 'Churro', 'Croissant', 'Pancake', 'Bacon', 'Omelette',
  'Soup', 'Chowder', 'Smoothie', 'Shake', 'Latte', 'Boba',
  'Lassi', 'Apple', 'Banana', 'Orange', 'Grape', 'Berry',
  'Melon', 'Peach', 'Cherry', 'Kiwi', 'Papaya', 'Guava',
  'Lychee', 'Coconut', 'Jellybean', 'Taffy', 'Popsicle', 'Sundae',
  'Sorbet', 'Macaron', 'Tiramisu', 'Churro', 'Eclair', 'Biscuit'
];

// Combos to blacklist (offensive or gross)
const BLACKLIST = new Set([
  'Rotten Egg', 'Moldy Cheese', 'Stale Fish', 'Burnt Toast',
  'Sour Milk', 'Rotten Mango', 'Moldy Bread', 'Rotten Banana'
]);

const generateAuraName = async () => {
  let attempts = 0;
  while (attempts < 100) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const food = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
    const name = `${adj} ${food}`;

    if (BLACKLIST.has(name)) { attempts++; continue; }

    const exists = await User.findOne({ auraName: name });
    if (!exists) return name;
    attempts++;
  }

  // Fallback: append random 4-digit number
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const food = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
  return `${adj} ${food} ${Math.floor(1000 + Math.random() * 9000)}`;
};

// Food-themed emoji palette for avatar
const FOOD_EMOJIS = ['🥭', '🍕', '🍔', '🌮', '🍩', '🍪', '🍜', '🍣', '🧇', '🍟',
  '🥐', '🍦', '🍰', '🧁', '🍫', '🥨', '🫔', '🧆', '🥙', '🍱'];

const randomFoodEmoji = () => FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];

const AURA_COLORS = ['#e91e63', '#4facfe', '#f7c948', '#5ec87a', '#ff6b6b', '#a855f7', '#fb923c', '#22d3ee'];
const randomAuraColor = () => AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)];

// ─── NODEMAILER ───────────────────────────────────────────────────────────────

function isSmtpConfigured() {
  const h = (process.env.SMTP_HOST || '').trim();
  const port = (process.env.SMTP_PORT || '').trim();
  const u = (process.env.SMTP_USER || '').trim();
  const p = (process.env.SMTP_PASS || '').trim();
  return !!(h && port && u && p);
}

/** When SMTP is not set: log OTP to the server console in non-production (or when OTP_DEV_MODE=true). */
function allowsConsoleOtp() {
  if (isSmtpConfigured()) return false;
  if (process.env.OTP_DEV_MODE === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

/**
 * @returns {Promise<{ devMode: boolean }>}
 */
const sendOTPEmail = async (email, otpCode) => {
  if (allowsConsoleOtp()) {
    console.log('\n[OYEEE OTP — dev / no SMTP] ───────────────────────────────');
    console.log(`  To:  ${email}`);
    console.log(`  OTP: ${otpCode}`);
    console.log('──────────────────────────────────────────────────────────────\n');
    return { devMode: true };
  }

  if (!isSmtpConfigured()) {
    const err = new Error(
      'Email (SMTP) is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env ' +
      '(see backend/.env.example), or use dev mode: run with NODE_ENV not equal to production so OTP is printed in this terminal.'
    );
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim()
    }
  });

  await transporter.sendMail({
    from: `"OYEEE" <${process.env.SMTP_USER.trim()}>`,
    to: email,
    subject: 'Your OYEEE Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;border:1px solid #e91e63;max-width:500px;margin:0 auto;">
        <h1 style="color:#e91e63;text-align:center;font-size:32px;letter-spacing:4px;margin:0 0 8px;">OYEEE<span style="color:#fff;">.</span></h1>
        <p style="text-align:center;opacity:0.6;font-size:12px;margin:0 0 32px;">one door. infinite anonymity.</p>
        <p style="font-size:16px;text-align:center;opacity:0.8;">Your verification code:</p>
        <div style="background:#1a1a1a;padding:24px;text-align:center;border-radius:8px;margin:24px 0;">
          <p style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#fff;margin:0;">${otpCode}</p>
        </div>
        <p style="font-size:13px;text-align:center;opacity:0.5;">Expires in 5 minutes. Do not share this code.</p>
        <div style="margin-top:32px;border-top:1px solid #333;padding-top:20px;text-align:center;">
          <p style="font-size:11px;opacity:0.3;">OYEEE — one door. infinite anonymity.</p>
        </div>
      </div>
    `
  });
  return { devMode: false };
};

// ─── SEND OTP ─────────────────────────────────────────────────────────────────

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }

    // Check duplicate before sending OTP
    const existing = await User.findOne({ email, emailVerified: true });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered. Please use the Login tab.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );
    const { devMode } = await sendOTPEmail(email, otpCode);

    res.status(200).json({
      message: devMode
        ? 'OTP generated (development: check the terminal running the backend).'
        : 'OTP sent to your email.',
      otpDevMode: devMode
    });
  } catch (err) {
    console.error('sendOTP error:', err);
    if (err?.code === 'SMTP_NOT_CONFIGURED') {
      return res.status(500).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// ─── SIGN UP ──────────────────────────────────────────────────────────────────

exports.signup = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // 1. Domain check
    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }

    // 2. Duplicate check
    const existing = await User.findOne({ email, emailVerified: true });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered. Please use the Login tab.' });
    }

    // 3. OTP verification
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP. Please check the code or request a new one.' });
    }
    const otpAge = (Date.now() - new Date(otpRecord.createdAt).getTime()) / 1000;
    if (otpAge > 300) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    // 4. Password strength (backend safety net)
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // 5. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. Generate unique food-based aura name + avatar
    const auraName = await generateAuraName();
    const avatarEmoji = randomFoodEmoji();
    const auraColor = randomAuraColor();

    // username = sanitized auraName (e.g., "crunchy_mango_a3f2")
    const baseUsername = auraName.toLowerCase().replace(/\s+/g, '_');
    const username = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;

    // 7. Remove any unverified placeholder user for this email
    await User.deleteOne({ email, emailVerified: false });

    // 8. Create user
    const user = await User.create({
      email,
      password: passwordHash,
      username,
      auraName,
      avatarEmoji,
      auraColor,
      emailVerified: true,
      authProvider: 'email',
      lifetimeAura: 100,
      spendableAura: 100,
      maxLifetimeAura: 100
    });

    // 9. Clean up OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // 10. JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        auraName: user.auraName,
        avatarEmoji: user.avatarEmoji,
        auraColor: user.auraColor,
        email: user.email,
        spendableAura: user.spendableAura,
        lifetimeAura: user.lifetimeAura,
        maxLifetimeAura: user.maxLifetimeAura
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    // Handle MongoDB duplicate key (race condition on auraName)
    if (err.code === 11000 && err.keyPattern?.auraName) {
      return res.status(500).json({ error: 'Name collision — please try again.' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }

    const user = await User.findOne({ email, emailVerified: true });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email. Please sign up first.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials. Please check your password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        auraName: user.auraName,
        avatarEmoji: user.avatarEmoji,
        auraColor: user.auraColor,
        email: user.email,
        spendableAura: user.spendableAura,
        lifetimeAura: user.lifetimeAura,
        maxLifetimeAura: user.maxLifetimeAura
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }
    const user = await User.findOne({ email, emailVerified: true });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate({ email }, { otp: otpCode, createdAt: new Date() }, { upsert: true, new: true });
    const { devMode } = await sendOTPEmail(email, otpCode);

    res.status(200).json({
      message: devMode
        ? 'Password reset OTP generated (development: check the backend terminal).'
        : 'Password reset OTP sent to your email.',
      otpDevMode: devMode
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── RESET PASSWORD (after forgot-password OTP) ───────────────────────────────

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(400).json({ error: 'Only @cgu-odisha.ac.in university emails are allowed.' });
    }
    if (!otp || String(otp).length !== 6) {
      return res.status(400).json({ error: 'Please enter the 6-digit OTP.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({ email, emailVerified: true });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    const otpRecord = await OTP.findOne({ email, otp: String(otp) });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP. Request a new code from Forgot Password.' });
    }
    const otpAge = (Date.now() - new Date(otpRecord.createdAt).getTime()) / 1000;
    if (otpAge > 300) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired. Request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: user._id }, { $set: { password: passwordHash } });
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: 'Password updated. You can log in now.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ error: err.message });
  }
};
