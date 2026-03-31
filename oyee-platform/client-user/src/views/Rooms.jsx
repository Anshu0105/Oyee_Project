import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rooms.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Check if Geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchNearbyRooms(latitude, longitude);
      },
      (err) => {
        console.error(err);
        setError('Failed to get your location. Please enable location permissions.');
        setLoading(false);
      }
    );
  }, []);

  const fetchNearbyRooms = async (lat, lng) => {
    try {
      // Backend is on port 5000 according to server.js
      const res = await axios.get(`http://localhost:5000/api/rooms/nearby?lat=${lat}&lng=${lng}`);
      setRooms(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch nearby rooms');
      setLoading(false);
    }
  };

  const handleJoin = (roomId) => {
    console.log(`Joining room ${roomId}...`);
    // Connect to room via socket or navigate to room page
    alert(`Successfully joined room!`);
  };

  return (
    <div className="rooms-container">
      <div className="rooms-header">
        <h2>Nearby Rooms</h2>
        <p>Discover and join live rooms within 2km of your location</p>
      </div>

      {loading && (
        <div className="status-message">
          <div className="loader">Locating nearby rooms...</div>
        </div>
      )}

      {error && !loading && (
        <div className="status-message" style={{ color: '#fc8181' }}>
          {error}
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="status-message">
          No rooms found near your current location.
        </div>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div className="room-card" key={room._id}>
              <h3 className="room-name">{room.name}</h3>
              <span className="room-type">{room.type}</span>
              
              <div className="room-stats">
                <div className="participant-count">
                  <div className="live-dot"></div>
                  <span>{room.activeUsers} Live Participants</span>
                </div>
              </div>
              
              <button className="join-btn" onClick={() => handleJoin(room._id)}>
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;