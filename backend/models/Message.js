const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
  user: String
});

module.exports = mongoose.model('Message', MessageSchema);