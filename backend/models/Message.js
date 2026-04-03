const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: String, required: true },
  text: String,
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  attachment: {
    url: String,
    name: String,
    fileType: String,
    size: String
  },
  state: { type: String, enum: ['sending', 'sent', 'delivered', 'read'], default: 'sent' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);