const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const Room = require('../../models/Room');

router.use(adminAuth);

router.get('/', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const rooms = await Room.find(filter).sort({ messageCount: -1 }).limit(100);
    res.json(rooms);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:roomId/close', async (req, res) => {
  try {
    await Room.findOneAndUpdate({ roomId: req.params.roomId }, { isActive: false });
    req.app.get('io').to(req.params.roomId).emit('room-closed');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:roomId', async (req, res) => {
  try {
    await Room.findOneAndDelete({ roomId: req.params.roomId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
