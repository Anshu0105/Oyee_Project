const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  segment: { type: String, required: true },
  user: { type: String }, // specific user if applicable
  scheduled: { type: Date },
  sent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);