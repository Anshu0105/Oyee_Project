const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  count: { type: Number, default: 0 }
});

// Ensure unique entry per user per day
UserActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('UserActivity', UserActivitySchema);
