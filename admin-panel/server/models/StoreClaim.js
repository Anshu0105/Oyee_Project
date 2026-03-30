const mongoose = require('mongoose');

const storeClaimSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  auraCost: { type: Number },
  processedBy: { type: String },
  processedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('StoreClaim', storeClaimSchema);
