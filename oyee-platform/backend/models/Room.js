const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['WiFi', 'University', 'GPS', '1-on-1'], required: true },
  activeUsers: { type: Number, default: 0 },
  status: { type: String, enum: ['Live', 'Moderated', 'Quiet', 'Locked'], default: 'Live' },
  violations: { type: Number, default: 0 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

roomSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Room', roomSchema);