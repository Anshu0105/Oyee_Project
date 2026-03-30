const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const Broadcast = require('../../models/Broadcast');

router.use(adminAuth);

router.get('/', async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 }).limit(20);
    res.json(broadcasts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { message, target, duration } = req.body;
    const broadcast = await Broadcast.create({ message, target, duration, sentBy: req.admin.id, sentAt: new Date() });
    req.app.get('io').emit('broadcast', { message, target, duration });
    res.json({ success: true, broadcast });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Broadcast.findByIdAndDelete(req.params.id);
    req.app.get('io').emit('broadcast-clear');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
