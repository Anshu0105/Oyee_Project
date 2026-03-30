const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a message
router.post('/messages', async (req, res) => {
  const { text, user } = req.body;
  const message = new Message({ text, user });
  try {
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;