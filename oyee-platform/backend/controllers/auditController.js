const Audit = require('../models/Audit');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createAuditLog = async (req, res) => {
  const { admin, action, target, ip } = req.body;
  try {
    const log = new Audit({ admin, action, target, ip });
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};