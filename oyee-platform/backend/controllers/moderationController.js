const Violation = require('../models/Violation');

exports.getViolations = async (req, res) => {
  try {
    const violations = await Violation.find().sort({ time: -1 });
    res.json(violations);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addViolation = async (req, res) => {
  const { user, message, flagged } = req.body;
  try {
    const violation = new Violation({ user, message, flagged });
    await violation.save();
    res.json(violation);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};