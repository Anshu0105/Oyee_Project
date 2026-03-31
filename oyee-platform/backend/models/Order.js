const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  item: { type: String, required: true },
  auraCost: { type: Number, required: true },
  user: { type: String, required: true },
  address: { type: String },
  status: { type: String, enum: ['pending', 'revealed', 'shipped', 'delivered'], default: 'pending' },
  claimedAt: { type: Date, default: Date.now },
  shippedAt: { type: Date },
  deliveredAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);