const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  emoji: { type: String },
  auraCost: { type: Number, required: true },
  totalClaims: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  stock: { type: Number, default: -1 },
}, { timestamps: true });

module.exports = mongoose.model('StoreItem', storeItemSchema);
