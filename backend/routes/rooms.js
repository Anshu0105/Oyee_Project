const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
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

module.exports = router;
