const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  room_code: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    minlength: 10,
    maxlength: 10
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true,
    default: ''
  },
  max_users: { 
    type: Number, 
    default: 30,
    enum: [30, 50, 100]
  },
  type: { 
    type: String, 
    default: 'private',
    enum: ['private', 'public']
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Room', RoomSchema);
