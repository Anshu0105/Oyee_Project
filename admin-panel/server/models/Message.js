const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  roomId: { type: String, required: true },
  roomType: { type: String, enum: ['wifi', 'university', 'nearby', 'dm'] },
  content: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'flagged', 'removed'],
    default: 'active'
  },
  flagReason: { type: String },
  flaggedAt: { type: Date },
  removedAt: { type: Date },
  removedBy: { type: String },
  reactions: [{ userId: String, type: String }],
  auraAwarded: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
