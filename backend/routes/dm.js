const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const DirectMessage = require('../models/DirectMessage');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

// Get all valid users for DM sidebar (friends and enemies only)
router.get('/available-users', verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('friends enemies');
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const allowedIds = [
      ...(currentUser.friends || []),
      ...(currentUser.enemies || [])
    ];

    if (allowedIds.length === 0) {
      return res.json([]);
    }

    const users = await User.find({ 
      _id: { $in: allowedIds }
    })
    .select('_id username auraName aura avatarEmoji equippedBadge isOnline')
    .sort({ username: 1 })
    .limit(200);

    const formattedUsers = await Promise.all(users.map(async (u) => {
      let isFriend = currentUser.friends.some(id => id.toString() === u._id.toString());
      let relationship = isFriend ? 'Friend' : 'Enemy';

      const lastMessage = await DirectMessage.findOne({
        $or: [
          { senderId: req.user.id, receiverId: u._id },
          { senderId: u._id, receiverId: req.user.id }
        ]
      }).sort({ createdAt: -1 });

      return {
        ...u.toObject(),
        relationship,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          type: lastMessage.type
        } : null
      };
    }));

    res.json(formattedUsers);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// Upload a file to Local Storage for DM
router.post('/upload-file', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5002'}/uploads/${req.file.filename}`;
  res.json({
    fileUrl,
    fileName: req.file.originalname,
    fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
  });
});

// Fetch DM history between two users
router.get('/history/:peerId', verifyToken, async (req, res) => {
  try {
    const messages = await DirectMessage.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.peerId },
        { senderId: req.params.peerId, receiverId: req.user.id }
      ]
    })
    .sort({ createdAt: 1 }) // Chronological order
    .populate('senderId', 'username avatarEmoji auraColor')
    .populate('receiverId', 'username avatarEmoji auraColor');
    
    res.json(messages);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// Post a new DM directly via API instead of Socket if preferred (optional)
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { receiverId, content, type, fileUrl, fileName, fileSize } = req.body;
    const dm = new DirectMessage({
      senderId: req.user.id,
      receiverId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize
    });
    const saved = await dm.save();
    res.json(saved);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
