import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, GraduationCap, MapPin, MessageSquare, AlertCircle, Loader2, X, Plus, LogIn } from 'lucide-react';
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
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalContext, setModalContext] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

  const openModal = (type, data, context = null) => {
    setActiveModalType(type);
    setModalData(data);
    setModalContext(context);
    setModalOpen(true);
  };

  const handleWifiRoom = async () => {
    setError('');
    const ssid = prompt("Enter your exact WiFi network name to discover others logically connected:");
    if (!ssid || ssid.trim() === '') return;
    
    setLoadingRoom('wifi');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/wifi`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ssid: ssid.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      openModal('wifi', data.rooms, { ssid: ssid.trim() });
    } catch(err) {
      setError(err.message);
    } finally {
      setLoadingRoom(null);
    }
  };

  const createWifiRoom = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/wifi/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ssid: modalContext.ssid })
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${data.room._id}`);
      } else throw new Error(data.error);
    } catch (err) { setError(err.message); }
  };

  const handleUniversityRoom = async () => {
    setError('');
    setLoadingRoom('uni');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/university/check-access`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error + (data.message ? " - " + data.message : ''));
      
      openModal('uni', [data.room]);
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
            body: JSON.stringify({ lat: latitude, lng: longitude, radiusKm: 2 })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || data.error || 'Failed to find geographic clusters');
          
          openModal('nearby', data.rooms, { lat: latitude, lng: longitude });
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

  const createNearbyRoom = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/nearby/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ lat: modalContext.lat, lng: modalContext.lng })
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${data.room._id}`);
      } else throw new Error(data.error);
    } catch (err) { setError(err.message); }
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

      {/* Overlay Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'var(--bg-main)', border: '1px solid var(--glass-border)',
                borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px', color: 'var(--accent-primary)' }}>
                  {activeModalType === 'wifi' && `WIFI: ${modalContext?.ssid}`}
                  {activeModalType === 'uni' && `UNIVERSITY CONNECT`}
                  {activeModalType === 'nearby' && `NEARBY (2km Radius)`}
                </h2>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {modalData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
                    <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--text-dim)' }} />
                    <p style={{ fontFamily: 'var(--font-mono)' }}>No active rooms found in this category.</p>
                  </div>
                ) : (
                  modalData.map(r => (
                    <div key={r._id} style={{ 
                      padding: '20px', border: '1px solid var(--glass-border)', borderRadius: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', letterSpacing: '1px' }}>{r.name}</h4>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          <span>Members: {r.members ? r.members.length : 0}</span>
                          {r.type === 'university' && <span style={{ color: '#48bb78' }}>[{r.universityDomain}]</span>}
                          {r.type === 'nearby' && <span style={{ color: '#ecc94b' }}>[within 2km]</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/room/${r._id}`)}
                        className="interactive hover-lift"
                        style={{
                          background: 'var(--accent-primary)', border: 'none', color: '#fff',
                          padding: '10px 20px', borderRadius: '4px', fontFamily: 'var(--font-bebas)',
                          letterSpacing: '1px', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                      >
                         <LogIn size={18} /> JOIN
                      </button>
                    </div>
                  ))
                )}
              </div>

              {(activeModalType === 'wifi' || activeModalType === 'nearby') && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                  <button 
                    onClick={activeModalType === 'wifi' ? createWifiRoom : createNearbyRoom}
                    className="interactive hover-lift"
                    style={{
                      width: '100%', padding: '16px', background: 'transparent', border: '1px dashed var(--accent-primary)',
                      color: 'var(--accent-primary)', borderRadius: '8px', fontFamily: 'var(--font-bebas)',
                      letterSpacing: '2px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <Plus size={20} /> CREATE NEW {activeModalType.toUpperCase()} ROOM
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Rooms;
