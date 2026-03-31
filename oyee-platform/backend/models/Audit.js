const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  admin: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
  ip: { type: String }
});

module.exports = mongoose.model('Audit', auditSchema);