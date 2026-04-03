const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
  user: String,
  senderId: String,
  roomId: String
});

module.exports = mongoose.model('Message', MessageSchema);