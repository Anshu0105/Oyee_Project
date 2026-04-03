import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, MapPin, Globe, Users, Search, Filter, ArrowRight } from 'lucide-react';

const RoomItem = ({ room, onJoin }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
    transition: 'all 0.3s',
    cursor: 'pointer'
  }}
  className="hover-lift"
  onClick={() => onJoin(room._id)}
  >
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'rgba(233, 30, 99, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--accent-primary)'
    }}>
      {room.type === 'Wifi' ? <Wifi size={24} /> : room.type === 'GPS-based' ? <MapPin size={24} /> : <Globe size={24} />}
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{room.name}</h4>
        {room.userCount > 10 && <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--accent-primary)', borderRadius: '4px', fontWeight: 'bold' }}>HOT</span>}
      </div>
      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.5 }}>{room.description || 'No description provided.'}</p>
    </div>

    <div style={{ textAlign: 'right' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
        <Users size={16} />
        {room.userCount || 0}
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '4px' }}>online</div>
    </div>
  </div>
);

const UniversityAggregator = ({ token, onJoinRoom }) => {
  const [rooms, setRooms] = useState({ wifi: [], gps: [], custom: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002')
    : 'https://oyeee-backend.onrender.com';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/university/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error("Failed to fetch university rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = (category) => {
    return rooms[category].filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const Section = ({ title, icon: Icon, category, color }) => {
    const list = filteredRooms(category);
    if (list.length === 0 && !searchTerm) return null;

    return (
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Icon size={20} color={color} />
          <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px', margin: 0 }}>{title} ({list.length})</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map(room => (
            <RoomItem key={room._id} room={room} onJoin={onJoinRoom} />
          ))}
          {list.length === 0 && searchTerm && (
            <p style={{ fontSize: '0.9rem', opacity: 0.4, padding: '20px', textAlign: 'center', border: '1px dashed #333', borderRadius: '12px' }}>No rooms found in this category.</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <Loader2 className="spin" size={48} color="var(--accent-primary)" />
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', opacity: 0.3 }} />
          <input
            type="text"
            placeholder="Filter university rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #333',
              borderRadius: '12px',
              color: '#fff',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
        </div>

        <Section title="WIFI ROOMS" icon={Wifi} category="wifi" color="#4a90e2" />
        <Section title="NEARBY ROOMS" icon={MapPin} category="gps" color="#ecc94b" />
        <Section title="CUSTOM ROOMS" icon={Globe} category="custom" color="var(--accent-primary)" />

        {Object.values(rooms).every(arr => arr.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed #333' }}>
            <h3 style={{ margin: '0 0 8px 0', opacity: 0.8 }}>No active rooms discovered.</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.5 }}>Be the first to manifest a new void at CGU-Odisha.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityAggregator;
