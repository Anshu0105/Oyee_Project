const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Friend', 'Enemy', 'Pending', 'Blocked'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Connection', connectionSchema);
