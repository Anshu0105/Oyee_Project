const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.banUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndUpdate(id, { banned: true });
    res.json({ msg: 'User banned' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};