import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, GraduationCap, MapPin, MessageSquare, AlertCircle, Loader2, Plus, Users, Search, TrendingUp, Cpu, Hash, Radio, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import ChoosePathModal from '../components/UI/ChoosePathModal';
import CreateRoomModal from '../components/UI/CreateRoomModal';
import NearbyMap from '../components/NearbyMap';

const RoomCard = ({ id, icon: Icon, title, desc, badge, badgeColor = 'var(--glass-border)', onClick, isLoading, isScanning }) => (
  <div 
    className="glass interactive room-card" 
    onClick={onClick}
    style={{
      minWidth: '280px',
      maxWidth: '280px',
      height: '350px',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      border: '1px solid var(--glass-border)',
      position: 'relative',
      overflow: 'hidden',
      scrollSnapAlign: 'start',
      flexShrink: 0
    }}
  >
    <div style={{ color: 'var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
        <Icon size={32} />
      </div>
      {(isLoading || isScanning) && <Loader2 size={24} className="spin" />}
    </div>
    
    <div style={{ flex: 1, marginTop: '20px' }}>
      <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', letterSpacing: '2px', margin: '0 0 8px 0' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: '1.6' }}>{desc}</p>
    </div>

    {isScanning && (
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: '100%' }} 
        transition={{ duration: 5 }}
        style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: 'var(--accent-primary)' }}
      />
    )}

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
      <span style={{ 
        fontSize: '0.65rem', padding: '6px 12px', background: badgeColor, borderRadius: '6px', letterSpacing: '1px', color: badgeColor !== 'var(--glass-border)' ? '#000' : '#fff', fontWeight: '900', textTransform: 'uppercase'
      }}>{badge}</span>
    </div>
  </div>
);

const TrendingCard = ({ icon: Icon, headline, source, metrics, category }) => (
  <div className="glass interactive trending-card" style={{
    minWidth: '240px',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexShrink: 0,
    background: 'rgba(255,255,255,0.02)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '1px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Icon size={12} color="var(--accent-primary)" /> {category}
      </span>
      <span>{metrics}</span>
    </div>
    <h4 style={{ fontSize: '1rem', fontWeight: '700', lineHeight: '1.4', margin: 0, height: '45px', overflow: 'hidden' }}>{headline}</h4>
    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Trending on {source}</div>
  </div>
);

const Rooms = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const [error, setError] = useState('');
  const [activeModals, setActiveModals] = useState({ choice: false, create: false, map: false });
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(null);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

  const handleCardClick = (id) => {
    setSelectedRoomId(id);
    if (id === 'dm') {
      navigate('/messages');
    } else {
      setActiveModals({ ...activeModals, choice: true });
    }
  };

  const onJoinChoice = async () => {
    if (selectedRoomId === 'wifi') {
      setActiveModals({ ...activeModals, choice: false });
      await autoDetectWifi();
    } else if (selectedRoomId === 'uni') {
      setActiveModals({ ...activeModals, choice: false });
      handleUniversityRoom();
    } else if (selectedRoomId === 'nearby') {
      setActiveModals({ ...activeModals, choice: false, map: true });
    }
  };

  const autoDetectWifi = async () => {
    setIsScanning(true);
    // Simulate scanner animation (5s)
    setTimeout(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rooms/wifi/detect`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        navigate(`/room/${data.roomId}`);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsScanning(false);
      }
    }, 5000);
  };

  const handleUniversityRoom = async () => {
    setLoadingRoom('uni');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/university/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // For now, let's just navigate to a generic uni global room if they have access
      // or we can show the new UniversityAggregator (Phase 3)
      navigate(`/room/uni_global`); 
    } catch(err) {
      setError(err.message);
    } finally {
      setLoadingRoom(null);
    }
  };

  const handleNearbyRoom = () => {
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
          // In Phase 4, this will open the Nearby Map
          // For now, let's keep the existing logic or go to a generic room
          const res = await fetch(`${BACKEND_URL}/api/rooms/nearby`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ lat: latitude, lng: longitude, radiusKm: 10 })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to find clusters');
          
          navigate(`/room/${data.rooms[0]?._id || 'nearby_global'}`);
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

  const handleCreateRoom = async (formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setActiveModals({ ...activeModals, create: false });
      navigate(`/room/${data.room._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const rooms = [
    { id: 'wifi', title: 'WIFI ROOM', icon: Wifi, desc: 'Connect with everyone on the same local network. Auto-detecting your pulse.', badge: 'AUTO-DETECT', isScanning: isScanning },
    { id: 'uni', title: 'UNIVERSITY', icon: GraduationCap, desc: 'Institutional hub. Verified all-rooms aggregator for CGU members.', badge: 'MAIL VERIFIED', badgeColor: '#48bb78', isLoading: loadingRoom === 'uni' },
    { id: 'nearby', title: 'NEARBY', icon: MapPin, desc: 'Physical radius chat. Pulse locked via Snapchat-style map view.', badge: 'GPS BASED', badgeColor: '#ecc94b', isLoading: loadingRoom === 'nearby' },
    { id: 'dm', title: 'DM', icon: MessageSquare, desc: 'Private one-on-one connections. Zero logs, 100% anonymous.', badge: 'PRIVATE CHAT' },
  ];

  const trends = [
    { category: 'TRENDING', icon: TrendingUp, headline: 'Iran-Israel Conflict Escalates', source: 'Twitter', metrics: '45k tweets' },
    { category: 'TECH', icon: Cpu, headline: 'Apple Vision Pro 2 Announced', source: 'Tech Forums', metrics: '5k post' },
    { category: 'MEMES', icon: Hash, headline: 'KitKat Truck Robbery Goes Viral', source: 'Reddit', metrics: '12k upvotes' },
    { category: 'PARTIES', icon: Radio, headline: 'Coachella 2026 Lineup Leaked', source: 'Instagram', metrics: '230k share' },
    { category: 'GOSSIP', icon: Zap, headline: 'New Void Star Discovered', source: 'OYEEE', metrics: '2k aura' },
  ];

  return (
    <div style={{ padding: '24px 0', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main)', overflowX: 'hidden' }}>
      
      {/* Search Bar Header */}
      <div style={{ padding: '0 40px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3.5rem', letterSpacing: '4px', margin: 0 }}>LIVE ROOMS</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5, marginTop: '8px' }}>// SELECT YOUR ENTRY POINT INTO THE VOID</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px', display: 'none' /* Will enable in search phase */ }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '12px', opacity: 0.3 }} />
          <input 
            type="text" 
            placeholder="Search rooms..." 
            style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            style={{ margin: '0 40px 32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', padding: '16px', background: 'rgba(233, 30, 99, 0.1)', border: '1px solid var(--accent-primary)', borderRadius: '12px', fontSize: '0.9rem' }}>
              <AlertCircle size={20} />
              {error}
              <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.5 }}>CLOSE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Horizontal Scrollable Row */}
      <div 
        className="horizontal-scroll"
        style={{ 
          display: 'flex', 
          gap: '24px', 
          padding: '0 40px 40px 40px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        <style>{`.horizontal-scroll::-webkit-scrollbar { display: none; }`}</style>
        {rooms.map(room => (
          <RoomCard key={room.id} {...room} onClick={() => handleCardClick(room.id)} />
        ))}
      </div>

      {/* Trending Section */}
      <div style={{ padding: '60px 40px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '3px', margin: 0, whiteSpace: 'nowrap' }}>
            WHAT'S <span style={{ color: 'var(--accent-primary)' }}>TRENDING</span>
          </h2>
          <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div className="horizontal-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
          {trends.map((t, idx) => (
            <TrendingCard key={idx} {...t} />
          ))}
        </div>
      </div>

      {/* Modals */}
      <ChoosePathModal 
        isOpen={activeModals.choice} 
        onClose={() => setActiveModals({ ...activeModals, choice: false })}
        onJoin={onJoinChoice}
        onCreate={() => setActiveModals({ choice: false, create: true })}
      />
      <CreateRoomModal
        isOpen={activeModals.create}
        onClose={() => setActiveModals({ ...activeModals, create: false })}
        onCreate={handleCreateRoom}
      />
      
      {activeModals.map && (
        <NearbyMap 
          token={token} 
          onClose={() => setActiveModals({ ...activeModals, map: false })}
          onJoinRoom={(id) => navigate(`/room/${id}`)}
        />
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .room-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-primary) !important;
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(233, 30, 99, 0.2);
        }
        .trending-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255,255,255,0.2) !important;
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default Rooms;
