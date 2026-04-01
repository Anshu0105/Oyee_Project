const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['nearby', 'university', 'wifi', 'public', 'private'], default: 'public' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Private Room Code
  roomCode: { type: String, unique: true, sparse: true, index: true },

  // Nearby
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  
  // University
  universityDomain: { type: String, index: true },

  // WiFi
  wifiSsid: { type: String, index: true },

  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

// Configure 2dsphere index for location-based GeoWithin queries for Nearby Rooms
RoomSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Room', RoomSchema);
