const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateRoomStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const room = await Room.findByIdAndUpdate(id, { status }, { new: true });
    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    await Room.findByIdAndDelete(id);
    res.json({ msg: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const mongoose = require('mongoose');

// Haversine formula for distance in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

exports.getNearbyRooms = async (req, res) => {
  try {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ msg: 'Please provide lng and lat query parameters' });
    }

    const userLng = parseFloat(lng);
    const userLat = parseFloat(lat);

    // If MongoDB is connected, use $near query
    if (mongoose.connection.readyState === 1) {
      const rooms = await Room.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [userLng, userLat] },
            $maxDistance: 2000 // 2km radius
          }
        }
      });
      return res.json(rooms);
    } else {
      // Fallback: Use mock data since MongoDB is not connected in your current server.js setup
      console.log('Serving mock nearby rooms (MongoDB not connected)');
      const mockRooms = [
        { _id: 'm1', name: 'Local WiFi Spot', type: 'WiFi', activeUsers: 14, coords: [userLng + 0.001, userLat + 0.001] },
        { _id: 'm2', name: 'Campus Library', type: 'University', activeUsers: 82, coords: [userLng - 0.005, userLat + 0.002] },
        { _id: 'm3', name: 'Downtown Hub (Too Far)', type: 'GPS', activeUsers: 5, coords: [userLng + 0.05, userLat + 0.05] }, // ~5km away
        { _id: 'm4', name: 'Nearby Coffee Shop', type: '1-on-1', activeUsers: 2, coords: [userLng + 0.008, userLat - 0.006] }
      ];

      const nearby = mockRooms.filter(room => {
        const dist = getDistanceFromLatLonInKm(userLat, userLng, room.coords[1], room.coords[0]);
        return dist <= 2.0;
      });

      return res.json(nearby);
    }
  } catch (err) {
    console.error('Error in getNearbyRooms:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};