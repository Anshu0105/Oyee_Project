const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
  user: String,
  senderId: String,
  roomId: String,
  flagged: { type: Boolean, default: false },
  flagReason: String,
  flaggedAt: { type: Date }
});

module.exports = mongoose.model('Message', MessageSchema);