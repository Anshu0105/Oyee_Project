const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  type: { type: String, required: true }, // ticker, banner, room alert, maintenance
  target: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);