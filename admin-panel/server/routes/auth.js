const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId, isAdmin: true });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.userId, isAdmin: true, identity: user.identity },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, admin: { userId: user.userId, identity: user.identity } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
