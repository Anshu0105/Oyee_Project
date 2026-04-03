const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  emailVerified: { type: Boolean, default: true }, // Auto verified for demo
  isOnline: { type: Boolean, default: true },
  socketId: { type: String, default: null },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  // DM Visual Profile
  auraName: { type: String, default: 'Anonymous Wanderer', unique: true, sparse: true },
  aura: { type: Number, default: Math.floor(Math.random() * 1000), index: -1 },
  avatarEmoji: { type: String, default: '👤' },
  auraColor: { type: String, default: '#FFFFFF' },
  equippedBadge: { type: String, default: '' },
  
  // Leaderboard Stats
  lastActive: { type: Date, default: Date.now },
  weeklyAuraGain: { type: Number, default: Math.floor(Math.random() * 100) },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  enemies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  createdAt: { type: Date, default: Date.now }
});

// Configure 2dsphere index for location-based GeoWithin queries for Nearby Rooms
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
