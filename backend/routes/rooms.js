const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Room = require('../models/Room');

// 1. WiFi Room - IP Detection & Auto-Join
router.post('/wifi/detect', verifyToken, async (req, res) => {
  try {
    // In a real production env, req.ip or x-forwarded-for would be used.
    // For this implementation, we'll simulate it or use the provided IP if any.
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Hash Subnet (e.g., 192.168.1.x)
    const subnet = ip.split('.').slice(0, 3).join('.');
    const networkHash = crypto.createHash('md5').update(subnet).digest('hex');
    
    const roomId = `wifi_${networkHash}`;
    
    // Check if room exists, if not create it
    let room = await Room.findOne({ networkHash });
    if (!room) {
      room = new Room({
        name: `WiFi Room (${subnet}.x)`,
        networkHash,
        type: 'Wifi',
        description: 'Automatically detected local network room.'
      });
      await room.save();
    }

    res.json({ 
      success: true, 
      roomId: room._id, // Internal ID or the string ID
      name: room.name,
      userCount: room.userCount
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GPS Based Room Discovery (Snapchat-style Heatmap backend)
router.post('/nearby', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10 } = req.body;
    
    // Update calling user's location
    await User.findByIdAndUpdate(req.user.id, {
      location: { type: 'Point', coordinates: [lng, lat] }
    });
    
    // Find rooms nearby
    const radiusInRadians = radiusKm / 6371;
    const nearbyRooms = await Room.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radiusInRadians] }
      }
    }).populate('creator', 'auraName');
    
    // Also find active users nearby for "hotspot" logic
    const nearbyUsers = await User.find({
      isOnline: true,
      _id: { $ne: req.user.id },
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radiusInRadians] }
      }
    });

    res.json({
      success: true,
      rooms: nearbyRooms,
      usersNearby: nearbyUsers.length,
      heatmapData: nearbyRooms.map(r => ({
        lat: r.location.coordinates[1],
        lng: r.location.coordinates[0],
        weight: r.userCount + 1
      }))
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create Custom Room
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name, description, type, maxUsers, lat, lng } = req.body;
    
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) return res.status(400).json({ error: 'Room name already taken' });

    const newRoom = new Room({
      name,
      description,
      type: type || 'Custom',
      maxUsers: maxUsers || 50,
      creator: req.user.id,
      location: lat && lng ? { type: 'Point', coordinates: [lng, lat] } : undefined
    });

    await newRoom.save();
    res.status(201).json({ success: true, room: newRoom });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. University Room Aggregator
router.get('/university/all', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.email.endsWith('@cgu-odisha.ac.in')) {
      return res.status(403).json({ error: "Institutional access required" });
    }

    // Return all active rooms created by university users
    const allRooms = await Room.find().sort({ userCount: -1 }).limit(50);
    
    res.json({
      success: true,
      university: "CGU-Odisha",
      activeRooms: allRooms.length,
      rooms: {
        wifi: allRooms.filter(r => r.type === 'Wifi'),
        gps: allRooms.filter(r => r.type === 'GPS-based'),
        custom: allRooms.filter(r => r.type === 'Custom' || r.type === 'Open')
      }
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
