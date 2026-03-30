const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  message: { type: String, required: true },
  target: { type: String, default: 'all' },
  duration: { type: Number, default: 30 },
  sentBy: { type: String },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Broadcast', broadcastSchema);
