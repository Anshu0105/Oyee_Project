const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Wifi', 'GPS-based', 'Open', 'Custom'],
    default: 'Custom'
  },
  maxUsers: {
    type: Number,
    default: 50
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  networkHash: {
    type: String,
    index: true
  }, // For WiFi rooms
  userCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

RoomSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Room', RoomSchema);
