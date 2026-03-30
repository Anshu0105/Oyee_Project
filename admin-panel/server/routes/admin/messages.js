const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const Message = require('../../models/Message');

router.use(adminAuth);

router.get('/', async (req, res) => {
  try {
    const { page=1, limit=20, roomId, status } = req.query;
    const filter = {};
    if (roomId) filter.roomId = roomId;
    if (status) filter.status = status;
    const [messages, total] = await Promise.all([
      Message.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      Message.countDocuments(filter)
    ]);
    res.json({ messages, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:msgId', async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.msgId, { status: 'removed', removedAt: new Date(), removedBy: req.admin.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
