const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'employee'], required: true },
  aura: { type: Number, default: 0 },
  tier: { type: String, enum: ['Ghost', 'Rising', 'Thunder', 'Starborn'], default: 'Ghost' },
  banned: { type: Boolean, default: false },
  shadowBanned: { type: Boolean, default: false },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);