const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const moderation = require('../utils/contentDetector');
const aiHelper = require('../utils/aiHelper');

// Public Room Messages (GET)
router.get('/messages', async (req, res) => {
  const { roomId = 'global' } = req.query;
  try {
    const messages = await Message.find({ roomId, flagged: false }).sort({ timestamp: -1 }).limit(50);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Flagged Messages
router.get('/messages/flagged', verifyToken, async (req, res) => {
  try {
    // Only allow admins
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Access restricted to administrators' });

    const flagged = await Message.find({ flagged: true }).sort({ flaggedAt: -1 });
    res.json(flagged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Approve Flagged
router.patch('/messages/:id/approve', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Deny' });

    await Message.findByIdAndUpdate(req.params.id, { flagged: false, flagReason: '' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Message
router.delete('/messages/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    // Only owner or admin can delete
    if (message.senderId !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Deny' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual Moderation Trigger (AI-Check)
router.post('/api/ai-moderate', verifyToken, async (req, res) => {
    try {
      const { text } = req.body;
      const result = await aiHelper.aiModerate(text);
      res.json(result);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;