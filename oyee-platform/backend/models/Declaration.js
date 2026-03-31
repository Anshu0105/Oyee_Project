const mongoose = require('mongoose');

const declarationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  target: { type: String, required: true },
  duration: { type: String, required: true },
  urgency: { type: String, default: 'info' },
  popup: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  status: { type: String, default: 'active' }
});

module.exports = mongoose.model('Declaration', declarationSchema);