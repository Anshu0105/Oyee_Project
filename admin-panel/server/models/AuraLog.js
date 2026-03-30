const mongoose = require('mongoose');

const auraLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  change: { type: Number, required: true },
  type: {
    type: String,
    enum: ['earned', 'spent', 'admin', 'penalty'],
    required: true
  },
  reason: { type: String },
  relatedId: { type: String },
  adminId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuraLog', auraLogSchema);
