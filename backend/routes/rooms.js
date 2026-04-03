const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Room = require('../models/Room');

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('members', 'username avatarEmoji auraName');
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ success: true, room });
  } catch(err) { res.status(500).json({ error: err.message }); }
});


// =====================================
// UNIVERSITY ROOMS
// =====================================
router.get('/university/check-access', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Extract domain from email (e.g. user@mit.edu -> mit.edu)
    const emailParts = user.email.split('@');
    if (emailParts.length !== 2) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const domain = emailParts[1].toLowerCase();

    // Exclude generic domains
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (commonDomains.includes(domain)) {
      return res.status(403).json({ 
        error: "University email required", 
        message: "Please use your institution email, generic domains not allowed." 
      });
    }

    // Check if room exists
    let room = await Room.findOne({ type: 'university', universityDomain: domain });
    
    if (!room) {
      // Auto-create University room
      room = new Room({
        name: `${domain.split('.')[0].toUpperCase()} Global Connect`,
        type: 'university',
        universityDomain: domain,
        createdBy: user._id,
        members: [] // Handled via sockets
      });
      await room.save();
    }

    res.json({ access: true, room });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// =====================================
// NEARBY ROOMS
// =====================================
router.post('/nearby', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radiusKm = 2 } = req.body;
    
    // Update user's latest location
    await User.findByIdAndUpdate(req.user.id, {
      location: { type: 'Point', coordinates: [lng, lat] }
    });
    
    const radiusInRadians = radiusKm / 6371; // Earth radius = ~6371km
    
    // Query active rooms within the radius
    const nearbyRooms = await Room.find({
      type: 'nearby',
      active: true,
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radiusInRadians] }
      }
    });
    
    res.json({
      success: true,
      rooms: nearbyRooms
    });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.post('/nearby/create', verifyToken, async (req, res) => {
  try {
    const { lat, lng, name } = req.body;
    
    const newRoom = new Room({
      name: name || `Nearby Point ${Math.floor(lat*10)}x${Math.floor(lng*10)}`,
      type: 'nearby',
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      createdBy: req.user.id
    });
    await newRoom.save();
    
    res.json({ success: true, room: newRoom });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// =====================================
// WIFI ROOMS
// =====================================
router.post('/wifi', verifyToken, async (req, res) => {
  try {
    const { ssid } = req.body;
    
    if (!ssid || ssid.trim() === '') {
      return res.status(400).json({ error: "SSID is required" });
    }

    const rooms = await Room.find({ type: 'wifi', wifiSsid: ssid.trim(), active: true });
    
    res.json({ success: true, rooms });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.post('/wifi/create', verifyToken, async (req, res) => {
  try {
    const { ssid } = req.body;
    
    if (!ssid || ssid.trim() === '') {
      return res.status(400).json({ error: "SSID is required" });
    }

    const newRoom = new Room({
      name: `${ssid} Local Connect`,
      type: 'wifi',
      wifiSsid: ssid.trim(),
      createdBy: req.user.id
    });
    await newRoom.save();
    
    res.json({ success: true, room: newRoom });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// =====================================
// PRIVATE ROOMS (4-DIGIT CODES)
// =====================================
router.post('/create-with-code', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Generate unique 4-digit code
    let roomCode;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      roomCode = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
      const existing = await Room.findOne({ roomCode });
      if (!existing) isUnique = true;
      attempts++;
    }
    
    if (!isUnique) throw new Error("Server overloaded. Failed to generate unique code.");

    const newRoom = new Room({
      name: name || `Secret Hub ${roomCode}`,
      type: 'private',
      roomCode,
      createdBy: req.user.id
    });
    
    await newRoom.save();
    res.json({ success: true, room: newRoom });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.post('/join-with-code', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Room code is required" });

    const room = await Room.findOne({ roomCode: code.toString(), type: 'private', active: true });
    
    if (!room) {
      return res.status(404).json({ error: "Void link expired or invalid code." });
    }

    res.json({ success: true, room });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

