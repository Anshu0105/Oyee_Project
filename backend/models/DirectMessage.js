const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  attachment: {
    url: String,
    name: String,
    fileType: String,
    size: String
  },
  state: { type: String, enum: ['sending', 'sent', 'delivered', 'read'], default: 'sent' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);
