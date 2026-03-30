const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');

router.use(adminAuth);

let settings = {
  maintenanceMode: false,
  registrationOpen: true,
  maxRoomSize: 50,
  auraDecayEnabled: false,
  chatRateLimit: 10,
};

router.get('/', async (req, res) => {
  res.json(settings);
});

router.put('/', async (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true, settings });
});

module.exports = router;
