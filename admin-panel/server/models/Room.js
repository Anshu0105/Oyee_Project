const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  type: { type: String, enum: ['wifi', 'university', 'nearby', 'dm'] },
  name: { type: String },
  activeUsers: [{ type: String }],
  messageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  metadata: {
    wifiSSID: String,
    universityDomain: String,
    gpsLat: Number,
    gpsLng: Number,
    gpsRadius: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
