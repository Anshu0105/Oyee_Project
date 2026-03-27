const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['WiFi', 'University', 'Nearby', 'Direct'], required: true },
  domain: { type: String }, // Applicable for University rooms
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Used for Direct 1-on-1 rooms
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
