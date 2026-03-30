const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const AuraLog = require('../../models/AuraLog');

router.use(adminAuth);

router.get('/', async (req, res) => {
  try {
    const { page=1, limit=50, userId, type } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    const [logs, total] = await Promise.all([
      AuraLog.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      AuraLog.countDocuments(filter)
    ]);
    res.json({ logs, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
