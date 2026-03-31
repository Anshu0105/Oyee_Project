const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { type, target, message } = req.body;
  try {
    const announcement = new Announcement({ type, target, message });
    await announcement.save();
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};