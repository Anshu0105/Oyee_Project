const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ totalUsers: userCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
