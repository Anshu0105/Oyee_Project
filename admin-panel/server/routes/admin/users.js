const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const User = require('../../models/User');
const AuraLog = require('../../models/AuraLog');

router.use(adminAuth);

router.get('/', async (req, res) => {
  try {
    const { page=1, limit=20, tier, status, search } = req.query;
    const filter = {};
    if (tier) filter.tier = tier;
    if (status) filter.status = status;
    if (search) filter.identity = { $regex: search, $options: 'i' };
    const [users, total] = await Promise.all([
      User.find(filter).sort({ auraPoints: -1 }).skip((page-1)*limit).limit(Number(limit)).select('-__v -passwordHash'),
      User.countDocuments(filter)
    ]);
    res.json({ users, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:userId/ban', async (req, res) => {
  try {
    const { reason } = req.body;
    await User.findOneAndUpdate({ userId: req.params.userId }, { status: 'banned', banReason: reason, bannedAt: new Date() });
    req.app.get('io').to(req.params.userId).emit('banned', { reason });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:userId/unban', async (req, res) => {
  try {
    await User.findOneAndUpdate({ userId: req.params.userId }, { status: 'offline', $unset: { banReason: 1, bannedAt: 1 } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:userId', async (req, res) => {
  try {
    await User.findOneAndDelete({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/adjust-aura', async (req, res) => {
  try {
    const { userId, change, reason } = req.body;
    const user = await User.findOneAndUpdate({ userId }, { $inc: { auraPoints: change } }, { new: true });
    await AuraLog.create({ userId, change, type: 'admin', reason, adminId: req.admin.id });
    res.json({ success: true, newAura: user.auraPoints });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
