const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const User = require('../../models/User');
const Message = require('../../models/Message');
const AuraLog = require('../../models/AuraLog');

router.use(adminAuth);

router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, onlineUsers, todayMessages, pendingFlags, auraCirculating] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'online' }),
      Message.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Message.countDocuments({ status: 'flagged' }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$auraPoints' } } }]),
    ]);
    res.json({ totalUsers, onlineUsers, todayMessages, pendingFlags, auraCirculating: auraCirculating[0]?.total || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/messages-7days', async (req, res) => {
  try {
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return new Date(d); });
    const data = await Promise.all(days.map(async (d) => {
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      return Message.countDocuments({ createdAt: { $gte: start, $lte: end } });
    }));
    res.json({ data, labels: days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' })) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/user-growth-30days', async (req, res) => {
  try {
    const data = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }, { $limit: 30 }
    ]);
    res.json({ data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
