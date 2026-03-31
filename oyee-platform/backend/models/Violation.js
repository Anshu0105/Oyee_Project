const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  flagged: { type: String, required: true },
  time: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Violation', violationSchema);