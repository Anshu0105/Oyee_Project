const Message = require('../models/Message');
const Room = require('../models/Room');

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  const { content, roomId } = req.body;
  try {
    const message = new Message({ content, room: roomId, user: req.user.id });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};