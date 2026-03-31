const Declaration = require('../models/Declaration');

exports.getDeclarations = async (req, res) => {
  try {
    const declarations = await Declaration.find().sort({ createdAt: -1 });
    res.json(declarations);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createDeclaration = async (req, res) => {
  const { type, title, message, target, duration, urgency, popup } = req.body;
  try {
    const declaration = new Declaration({ type, title, message, target, duration, urgency, popup });
    await declaration.save();
    res.json(declaration);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};