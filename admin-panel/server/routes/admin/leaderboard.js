const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const User = require('../../models/User');

router.use(adminAuth);

router.get('/', async (req, res) => {
  try {
    const { limit=20 } = req.query;
    const users = await User.find().sort({ auraPoints: -1 }).limit(Number(limit)).select('userId identity auraPoints tier status -_id');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/thresholds', async (req, res) => {
  // Would typically save to a Settings collection
  res.json({ success: true, thresholds: req.body });
});

module.exports = router;
