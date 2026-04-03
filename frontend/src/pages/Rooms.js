import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, GraduationCap, MapPin, MessageSquare, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { BACKEND_URL, safeFetch } from '../config';
import PrivateRoomModal from '../components/Rooms/PrivateRoomModal';

const RoomCard = ({ icon: Icon, title, desc, badge, badgeColor = 'rgba(255,255,255,0.05)', onClick, isLoading }) => (
  <div className="glass interactive hover-lift" onClick={onClick} style={{
    padding: '40px 30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '24px',
    height: '100%',
    position: 'relative'
  }}>
    <div style={{ 
      width: '60px', 
      height: '60px', 
      background: 'rgba(255, 255, 255, 0.03)', 
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'var(--accent-primary)'
    }}>
      <Icon size={32} />
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
      <h3 style={{ fontWeight: '800', fontSize: '2rem', letterSpacing: '1px', color: '#fff', lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', opacity: 0.6, lineHeight: '1.6', color: 'var(--text-main)' }}>{desc}</p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ 
        fontSize: '0.65rem', 
        padding: '6px 12px', 
        background: badgeColor, 
        borderRadius: '6px', 
        letterSpacing: '1px', 
        color: badgeColor !== 'rgba(255,255,255,0.05)' ? '#000' : '#fff', 
        fontWeight: '700',
        fontFamily: 'var(--font-mono)'
      }}>{badge}</span>
      {isLoading && <Loader2 size={16} className="spin" style={{ color: 'var(--accent-primary)' }} />}
    </div>
  </div>
);

const TrendingCard = ({ category, icon: Icon, title, stats, source }) => (
  <div className="glass" style={{
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    width: '300px',
    flexShrink: 0
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontSize: '0.65rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
        <Icon size={12} />
        {category}
      </div>
      <div style={{ fontSize: '0.65rem', opacity: 0.4, fontFamily: 'var(--font-mono)' }}>{stats}</div>
    </div>
    <h4 style={{ fontWeight: '700', fontSize: '1.2rem', color: '#fff', marginBottom: '16px', lineHeight: 1.3 }}>{title}</h4>
    <div style={{ fontSize: '0.7rem', opacity: 0.3, fontWeight: '500' }}>{source}</div>
  </div>
);

const Rooms = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const [error, setError] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(null);
  const [wifiStep, setWifiStep] = useState('IDLE'); // IDLE, DETECTING, DETECTED
  const [detectedIp, setDetectedIp] = useState('');
  const [isPrivateModalOpen, setPrivateModalOpen] = useState(false);

  const handleWifiRoom = async () => {
    setError('');
    setLoadingRoom('wifi');
    setWifiStep('DETECTING');
    
    try {
      // Step 1: Detect IP
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const publicIp = ipData.ip;
      
      setDetectedIp(publicIp);
      await new Promise(r => setTimeout(r, 1500)); // Dramatic pause for detection
      
      // Step 2: Transition to success
      setWifiStep('DETECTED');
      await new Promise(r => setTimeout(r, 1500)); // Show IP to user
      
      // Step 3: Discover room
      const data = await safeFetch('/api/rooms/wifi/discover', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ip: publicIp })
      });
      
      navigate(`/room/${data.roomId}`);
    } catch(err) {
      setError(err.message || 'Network detection failed. Please try again.');
      setWifiStep('IDLE');
    } finally {
      setLoadingRoom(null);
    }
  };

  const handleUniversityRoom = async () => {
    setError('');
    setLoadingRoom('uni');
    try {
      const data = await safeFetch('/api/rooms/university/check-access', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
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
          const data = await safeFetch('/api/rooms/nearby', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ lat: latitude, lng: longitude, radiusKm: 5 })
          });
          
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
    { id: 'wifi', title: 'WIFI ROOM', icon: Wifi, desc: 'Connect with everyone on the same local network. Auto-detecting your pulse.', badge: 'AUTO-DETECT', onClick: handleWifiRoom },
    { id: 'uni', title: 'UNIVERSITY', icon: GraduationCap, desc: 'Unified Institutional Hub. A single shared void for all verified CGU members to connect collectively.', badge: 'MAIL VERIFIED', badgeColor: '#48bb78', onClick: handleUniversityRoom },
    { id: 'nearby', title: 'NEARBY', icon: MapPin, desc: 'Physical radius chat. Pulse locked via Snapchat-style map view.', badge: 'GPS BASED', badgeColor: '#ecc94b', onClick: handleNearbyRoom },
    { id: 'private', title: 'PRIVATE ROOMS', icon: Lock, desc: 'Create your own collective void or join an invite-only space.', badge: 'ROOM CODE', badgeColor: '#FF0055', onClick: () => setPrivateModalOpen(true) },
  ];

  const trendingItems = [
    { category: 'TRENDING', icon: Wifi, title: 'Iran-Israel Conflict Escalates', stats: '45k tweets', source: 'Trending on Twitter' },
    { category: 'TECH', icon: GraduationCap, title: 'Apple Vision Pro 2 Announced', stats: '5k post', source: 'Trending on Tech Forums' },
    { category: 'MEMES', icon: AlertCircle, title: 'KitKat Truck Robbery Goes Viral', stats: '12k upvotes', source: 'Trending on Reddit' },
    { category: 'PARTIES', icon: MapPin, title: 'Coachella 2026 Lineup Leaked', stats: '230k share', source: 'Trending on Instagram' },
    { category: 'GOSSIP', icon: MessageSquare, title: 'New Void Star Discovered', stats: 'Just now', source: 'Trending on OYEEE' },
  ];

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* WiFi Loading Overlay */}
      <AnimatePresence>
        {loadingRoom === 'wifi' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2000, flexDirection: 'column', gap: '32px'
            }}
          >
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              {wifiStep === 'DETECTING' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '100%', height: '100%', border: '4px solid rgba(255,0,85,0.1)',
                    borderTop: '4px solid #FF0055', borderRadius: '50%'
                  }}
                />
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 0] }}
                  style={{ color: '#48bb78', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                >
                  <CheckCircle size={100} />
                </motion.div>
              )}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <motion.h3 
                key={wifiStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '1px' }}
              >
                {wifiStep === 'DETECTING' ? 'Detecting IP address...' : 'Detected IP address'}
              </motion.h3>
              {wifiStep === 'DETECTED' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: '#FF0055', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1.4rem', letterSpacing: '2px' }}
                >
                  {detectedIp}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontWeight: '800', fontSize: '4.5rem', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '16px' }}>LIVE ROOMS</h1>
        <p style={{ fontWeight: '500', fontSize: '1rem', opacity: 0.5, letterSpacing: '1px' }}>// SELECT YOUR ENTRY POINT INTO THE VOID</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }} 
            exit={{ opacity: 0, y: -20, height: 0 }}
            style={{ marginBottom: '32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', padding: '16px', background: 'rgba(233, 30, 99, 0.1)', border: '1px solid var(--accent-primary)', borderRadius: '12px', fontSize: '0.9rem' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '24px',
        marginBottom: '100px'
      }}>
        {rooms.map(room => (
          <div key={room.id} style={{ height: '100%' }}>
            <RoomCard {...room} isLoading={loadingRoom === room.id} />
          </div>
        ))}
      </div>

      {/* Trending Section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        marginBottom: '40px' 
      }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(270deg, rgba(233, 30, 99, 0.4) 0%, rgba(233, 30, 99, 0) 100%)' }} />
        <h2 style={{ 
          fontFamily: 'var(--font-main)', 
          fontWeight: '800', 
          fontSize: '2.5rem', 
          letterSpacing: '2px', 
          margin: 0,
          whiteSpace: 'nowrap'
        }}>
          WHAT'S <span style={{ color: 'var(--accent-primary)' }}>TRENDING</span>
        </h2>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(233, 30, 99, 0.4) 0%, rgba(233, 30, 99, 0) 100%)' }} />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        overflowX: 'auto', 
        paddingBottom: '24px',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }} className="hide-scrollbar">
        {trendingItems.map((item, i) => (
          <TrendingCard key={i} {...item} />
        ))}
      </div>

      <PrivateRoomModal 
        isOpen={isPrivateModalOpen} 
        onClose={() => setPrivateModalOpen(false)} 
      />

      <style>{`
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Rooms;
