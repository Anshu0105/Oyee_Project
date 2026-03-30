const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const Message = require('../../models/Message');
const User = require('../../models/User');

router.use(adminAuth);

router.get('/flagged', async (req, res) => {
  try {
    const messages = await Message.find({ status: 'flagged' }).sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:msgId/approve', async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.msgId, { status: 'active', flagReason: null });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:msgId/remove', async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.msgId, { status: 'removed', removedAt: new Date(), removedBy: req.admin.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:msgId/remove-and-ban', async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.msgId, { status: 'removed', removedAt: new Date() }, { new: true });
    await User.findOneAndUpdate({ userId: msg.senderId }, { status: 'banned', banReason: `Auto: ${msg.flagReason}`, bannedAt: new Date() });
    req.app.get('io').to(msg.senderId).emit('banned', { reason: msg.flagReason });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/automod-rules', async (req, res) => {
  res.json({ blockPhoneNumbers: true, blockRealNames: true, blockLinks: true, profanityFilter: true, spamDetection: false });
});

router.put('/automod-rules', async (req, res) => {
  res.json({ success: true, rules: req.body });
});

module.exports = router;
