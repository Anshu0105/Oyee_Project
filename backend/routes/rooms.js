const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');
const aiHelper = require('../utils/aiHelper');
const { generateRoomCode } = require('../utils/roomGenerator');
const crypto = require('crypto');

// University Room Validation Endpoint
router.get('/university/check-access', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(403).json({ 
        error: "University email required", 
        message: "Please log out and verify your @cgu-odisha.ac.in identity" 
      });
    }
    if (!user.emailVerified) {
       return res.status(403).json({ 
         error: "Email not verified", 
         message: "Verification pending. Check your university inbox." 
       });
    }
    res.json({ access: true, roomId: "uni_global" });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// GPS Based Room Clustering Endpoint using Haversine algorithm
router.post('/nearby', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5 } = req.body;
    
    // First, update the calling user's geospatial location in the DB
    await User.findByIdAndUpdate(req.user.id, {
      location: { type: 'Point', coordinates: [lng, lat] }
    });
    
    // Convert km to radians for MongoDB $centerSphere (Earth radius = ~6371km)
    const radiusInRadians = radiusKm / 6371;
    
    // Find all users (excluding self) within the geographic sphere who are Online
    const nearbyUsers = await User.find({
      isOnline: true,
      _id: { $ne: req.user.id },
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radiusInRadians] }
      }
    });
    
    // Build dynamic room based on cluster logic
    // Using a hashed generic bounding name or simple radius name to group peers
    const clusterRoomId = `nearby_${Math.floor(lat * 10)}_${Math.floor(lng * 10)}`;
    
    res.json({
      success: true,
      roomId: clusterRoomId,
      usersFound: nearbyUsers.length,
      users: nearbyUsers.map((u) => ({ auraName: u.auraName, badge: u.equippedBadge })) // Anonymized subset
    });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// Automated WiFi Room Discovery (Based on Public IPv4)
router.post('/wifi/discover', verifyToken, async (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP address is required' });
    
    // Hash the public IPv4 to create a unique, privacy-safe room ID
    const hash = crypto
      .createHash('sha256')
      .update(ip.trim() + (process.env.JWT_SECRET || 'oyeee_secret'))
      .digest('hex')
      .substring(0, 12);
      
    res.json({ success: true, roomId: `wifi_${hash}` });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// AI Chat Unread Summary (max 4 bullets)
router.get('/summarize/:roomId', verifyToken, async (req, res) => {
    try {
      const { roomId } = req.params;
      const { limit = 20 } = req.query;
  
      // Get last unread/recent messages from room (anonymized)
      const messages = await Message.find({ roomId, flagged: false })
          .sort({ timestamp: -1 })
          .limit(parseInt(limit))
          .select('user text');
      
      if (messages.length < 5) return res.json({ summary: "The void is quiet. No recent conversations to summarize." });
  
      const summary = await aiHelper.summarizeMessages(messages.reverse());
      res.json({ summary, count: messages.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Nearby AI Activity Analysis (15km radius)
router.post('/nearby/summary', verifyToken, async (req, res) => {
    try {
      const { lat, lng } = req.body;
      const radiusKm = 15; // As per requirement
      const radiusInRadians = radiusKm / 6371;
  
      // Find online users within 15km
      const nearbyUsers = await User.find({
        isOnline: true,
        location: {
          $geoWithin: { $centerSphere: [[lng, lat], radiusInRadians] }
        }
      });
  
      // Extract unique cluster IDs for active nearby rooms
      const clusterIds = [...new Set(nearbyUsers.map(u => `nearby_${Math.floor(u.location.coordinates[1] * 10)}_${Math.floor(u.location.coordinates[0] * 10)}`))];
  
      // Get last 20 messages for each affected room cluster
      const roomsData = await Promise.all(clusterIds.slice(0, 3).map(async (roomId) => {
          const messages = await Message.find({ roomId, flagged: false })
              .sort({ timestamp: -1 })
              .limit(20)
              .select('text');
          return { name: roomId, messages: messages.map(m => m.text) };
      }));
  
      const filteredRooms = roomsData.filter(r => r.messages.length > 0);
      
      if (filteredRooms.length === 0) {
          return res.json({ summary: "No recent activity discovered in your immediate void frequency." });
      }
  
      const summary = await aiHelper.summarizeNearbyRooms(filteredRooms);
      res.json({ summary, radius: radiusKm, activeClusters: filteredRooms.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Private Room Management
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name, description, max_users } = req.body;
    
    let room_code;
    let isUnique = false;
    while (!isUnique) {
      room_code = generateRoomCode();
      const existing = await Room.findOne({ room_code });
      if (!existing) isUnique = true;
    }

    const newRoom = new Room({
      room_code,
      name,
      description,
      max_users: parseInt(max_users) || 30,
      created_by: req.user.id,
      members: [req.user.id]
    });

    await newRoom.save();
    res.status(201).json({ success: true, room: newRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/join', verifyToken, async (req, res) => {
  try {
    const { room_code } = req.body;
    if (!room_code) return res.status(400).json({ error: 'Room code is required' });

    // Case-insensitive manifest lookup
    const room = await Room.findOne({ 
      room_code: { $regex: new RegExp(`^${room_code.trim()}$`, 'i') } 
    });
    
    if (!room) return res.status(404).json({ error: 'Room not found or expired' });

    if (room.members.length >= room.max_users) {
      return res.status(400).json({ error: 'Room is full' });
    }

    if (!room.members.includes(req.user.id)) {
      room.members.push(req.user.id);
      await room.save();
    }

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/info/:roomCode', verifyToken, async (req, res) => {
  try {
    // Case-insensitive manifest lookup for direct navigation
    const room = await Room.findOne({ 
      room_code: { $regex: new RegExp(`^${req.params.roomCode.trim()}$`, 'i') } 
    });
    
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
