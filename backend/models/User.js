const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  foodName: { type: String, required: true },
  aura: { type: Number, default: 0 },
  universityDomain: { type: String }, // e.g. "university.edu"
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
