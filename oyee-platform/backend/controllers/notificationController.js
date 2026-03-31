const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createNotification = async (req, res) => {
  const { type, title, body, segment, user, scheduled } = req.body;
  try {
    const notification = new Notification({ type, title, body, segment, user, scheduled });
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};