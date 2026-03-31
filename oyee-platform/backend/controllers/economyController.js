// Economy controller for Aura points, Store, Orders
const User = require('../models/User');

exports.getAuraPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ aura: user.aura });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.purchaseItem = async (req, res) => {
  // Logic for purchasing
  res.json({ msg: 'Purchase successful' });
};