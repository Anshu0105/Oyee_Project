const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['nearby', 'university', 'wifi', 'public'], default: 'public' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
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
