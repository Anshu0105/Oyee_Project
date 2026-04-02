import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, GraduationCap, MapPin, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';

const RoomCard = ({ icon: Icon, title, desc, badge, badgeColor = 'var(--glass-border)', onClick, isLoading }) => (
  <div className="glass interactive hover-lift" onClick={onClick} style={{
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid var(--glass-border)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ color: 'var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Icon size={40} />
      {isLoading && <Loader2 size={24} className="spin" />}
    </div>
    <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', letterSpacing: '2px' }}>{title}</h3>
    <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.6' }}>{desc}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
      <span style={{ 
        fontSize: '0.7rem', padding: '4px 10px', background: badgeColor, borderRadius: '4px', letterSpacing: '1px', color: badgeColor !== 'var(--glass-border)' ? '#000' : '#fff', fontWeight: 'bold'
      }}>{badge}</span>
    </div>
  </div>
);

const Rooms = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const [error, setError] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://oyeee-backend.onrender.com';

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const handleWifiRoom = async () => {
    setError('');
    setLoadingRoom('wifi');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/wifi/discover`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to detect network');
      
      navigate(`/room/${data.roomId}`);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoadingRoom(null);
    }
  };

  const handleUniversityRoom = async () => {
    setError('');
    setLoadingRoom('uni');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/university/check-access`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error + " - " + data.message);
      
      navigate(`/room/${data.roomId}`);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoadingRoom(null);
    }
  };

  const handleNearbyRoom = () => {
    setError('');
    setLoadingRoom('nearby');
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoadingRoom(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`${BACKEND_URL}/api/rooms/nearby`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ lat: latitude, lng: longitude, radiusKm: 5 })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || data.error || 'Failed to find geographic clusters');
          
          navigate(`/room/${data.roomId}`);
        } catch(err) {
          setError(err.message);
        } finally {
          setLoadingRoom(null);
        }
      },
      (geoError) => {
        setError("Location access denied. Enable location to discover nearby rooms.");
        setLoadingRoom(null);
      }
    );
  };

  const rooms = [
    { id: 'wifi', title: 'WIFI ROOM', icon: Wifi, desc: 'Connect with everyone on the same local network. Same router = same room.', badge: 'AUTO-DETECT', onClick: handleWifiRoom },
    { id: 'uni', title: 'UNIVERSITY ROOM', icon: GraduationCap, desc: 'Exclusive to your institution. Verified via university mail domain.', badge: 'MAIL VERIFIED', badgeColor: '#48bb78', onClick: handleUniversityRoom },
    { id: 'nearby', title: 'NEARBY ROOMS', icon: MapPin, desc: 'Discover chat rooms within your physical radius. GPS locked.', badge: 'GPS BASED', badgeColor: '#ecc94b', onClick: handleNearbyRoom },
    { id: 'dm', title: 'DM', icon: MessageSquare, desc: 'Direct anonymous messages. Connect with your campus peers privately.', badge: 'PRIVATE CHAT', onClick: () => navigate('/messages') },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '4px' }}>JOIN A ROOM</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.6 }}>// select your entry point into the void</p>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-primary)', marginTop: '16px' }} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }} 
            exit={{ opacity: 0, y: -20, height: 0 }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', padding: '16px', background: 'rgba(233, 30, 99, 0.1)', border: '1px solid var(--accent-primary)', borderRadius: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px' 
      }}>
        {rooms.map(room => (
          <RoomCard key={room.id} {...room} isLoading={loadingRoom === room.id} />
        ))}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Rooms;
