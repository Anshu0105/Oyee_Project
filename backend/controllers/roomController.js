const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

exports.getRoomMessages = async (req, res) => {
  try {
    const { roomName } = req.params;
    const messages = await Message.find({ roomName })
      .populate('senderId', 'foodName aura')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.voteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { action } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Ensure user hasn't already voted the same way
    const hasUpvoted = message.upvotedBy.includes(userId);
    const hasDownvoted = message.downvotedBy.includes(userId);

    let scoreChange = 0;

    if (action === 'upvote') {
      if (hasUpvoted) return res.status(400).json({ error: 'Already upvoted' });
      message.upvotedBy.push(userId);
      scoreChange = 1;
      if (hasDownvoted) {
         message.downvotedBy.pull(userId);
         scoreChange = 2; // Flip from -1 to +1
      }
    } else if (action === 'downvote') {
      if (hasDownvoted) return res.status(400).json({ error: 'Already downvoted' });
      message.downvotedBy.push(userId);
      scoreChange = -1;
      if (hasUpvoted) {
        message.upvotedBy.pull(userId);
        scoreChange = -2; // Flip from +1 to -1
      }
    }

    message.auraScore += scoreChange;
    await message.save();

    // Update the sender's total aura
    await User.findByIdAndUpdate(message.senderId, { $inc: { aura: scoreChange } });

    // Broadcast the updated message to the room
    const io = req.app.get('io');
    if (io) {
      await message.populate('senderId', 'foodName aura');
      io.to(message.roomName).emit('update_message', message);
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to vote' });
  }
};
