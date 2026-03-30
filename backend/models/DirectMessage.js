const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  fileUrl: { type: String, default: null },
  fileName: { type: String, default: null },
  fileSize: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);
