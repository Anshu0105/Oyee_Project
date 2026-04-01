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
  // Aura System (Fixed Deposit vs Spendable)
  lifetimeAura: { type: Number, default: 100 }, // Total earned ever
  spendableAura: { type: Number, default: 100 }, // Current liquid balance
  maxLifetimeAura: { type: Number, default: 100 }, // Peak aura ever reached
  
  // Visual Profile
  auraName: { type: String, default: 'Anonymous Wanderer' },
  avatarEmoji: { type: String, default: '👤' },
  equippedBadge: { type: String, default: '' },
  auraColor: { type: String, default: '#e91e63' },
  
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
