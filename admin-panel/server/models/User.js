const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  identity: { type: String },
  emailDomain: { type: String },
  auraPoints: { type: Number, default: 0 },
  tier: {
    type: String,
    enum: ['ghost', 'rising', 'thunder', 'starborn'],
    default: 'ghost'
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'banned'],
    default: 'offline'
  },
  currentRoom: { type: String, default: null },
  warnings: { type: Number, default: 0 },
  banReason: { type: String },
  bannedAt: { type: Date },
  lastActive: { type: Date },
  theme: { type: String, default: 'wine-purple' },
  friends: [{ type: String }],
  enemies: [{ type: String }],
  isAdmin: { type: Boolean, default: false },
  passwordHash: { type: String },
}, { timestamps: true });

userSchema.pre('save', function(next) {
  const pts = this.auraPoints;
  if (pts >= 1000) this.tier = 'starborn';
  else if (pts >= 500) this.tier = 'thunder';
  else if (pts >= 200) this.tier = 'rising';
  else this.tier = 'ghost';
  next();
});

module.exports = mongoose.model('User', userSchema);
