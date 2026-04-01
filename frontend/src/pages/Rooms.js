import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, GraduationCap, MapPin, MessageSquare, AlertCircle, Loader2, X, Plus, LogIn } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';

const RoomCard = ({ icon: Icon, title, desc, badge, badgeColor = 'var(--glass-border)', onClick, isLoading }) => (
  <motion.div 
    className="glass interactive" 
    onClick={onClick}
    whileHover={{ 
      scale: 1.01,
      backgroundColor: 'rgba(255,255,255,0.05)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 15px var(--accent-primary)'
    }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    style={{
      padding: '24px 32px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '24px',
      cursor: 'pointer',
      border: 'none',
      borderBottom: '1px solid var(--glass-border)',
      borderTop: '1px solid var(--glass-border)',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      minHeight: '110px',
      borderRadius: '0',
      zIndex: 1
    }}
  >
    {/* Sensor Frame Icon */}
    <div style={{ 
      color: 'var(--accent-primary)', 
      minWidth: '64px', 
      height: '64px',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      boxShadow: 'inset 0 0 15px rgba(255,255,255,0.05)',
      position: 'relative'
    }}>
      <Icon size={32} />
      <div style={{ position: 'absolute', top: -2, left: -2, width: 8, height: 8, borderTop: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)' }} />
      <div style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderBottom: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)' }} />
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
        <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', letterSpacing: '2px', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>{title}</h3>
        <span style={{ 
          fontSize: '0.65rem', padding: '2px 10px', background: badgeColor, borderRadius: '4px', letterSpacing: '1px', color: badgeColor !== 'var(--glass-border)' ? '#000' : '#fff', fontWeight: 'bold', height: 'fit-content', opacity: 0.9
        }}>{badge}</span>
      </div>
      <p style={{ fontSize: '0.9rem', opacity: 0.6, lineHeight: '1.5', fontFamily: 'var(--font-inter)' }}>{desc}</p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {isLoading && <Loader2 size={24} className="spin" color="var(--accent-primary)" />}
      <div style={{ 
        width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)',
        background: 'rgba(255,255,255,0.03)',
        transition: 'all 0.3s'
      }}>
        <LogIn size={20} />
      </div>
    </div>
  </motion.div>
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

  // WiFi Discovery States
  const [isScanning, setIsScanning] = useState(false);
  const [noWifiPopup, setNoWifiPopup] = useState(false);
  const [tempSsid, setTempSsid] = useState('');
  const [scanningStatus, setScanningStatus] = useState('Initializing search...');

  // Private Hub States
  const [privateCode, setPrivateCode] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };



  const openModal = (type, data, context = null) => {
    setActiveModalType(type);
    setModalData(data);
    setModalContext(context);
    setModalOpen(true);
  };

  const handleWifiRoom = async () => {
    setError('');
    
    // Step 1: Connectivity check
    if (!navigator.onLine) {
      setNoWifiPopup(true);
      return;
    }

    // Step 2: Show Scanning UI
    setIsScanning(true);
    setScanningStatus('Detecting network nodes...');
    
    // Simulate a high-fidelity scan
    await new Promise(r => setTimeout(r, 1200));
    setScanningStatus('Identifying SSID signatures...');
    await new Promise(r => setTimeout(r, 1300));
    
    setIsScanning(false);
    
    // Step 3: Show beautiful SSID input instead of raw prompt
    setActiveModalType('wifi-entry');
    setModalOpen(true);
  };

  const performWifiSearch = async (ssid) => {
    if (!ssid || ssid.trim() === '') return;
    setLoadingRoom('wifi');
    setModalOpen(false); // Close entry modal to refresh with results
    
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
    { id: 'private', title: 'PRIVATE HUB', icon: Plus, desc: 'Create or join a private peers room using a unique 4-digit secret code.', badge: 'SECURE LINK', badgeColor: 'var(--accent-primary)', onClick: () => navigate('/private-hub') },
    { id: 'dm', title: 'DM', icon: MessageSquare, desc: 'Direct anonymous messages. Connect with your campus peers privately.', badge: 'PRIVATE CHAT', onClick: () => navigate('/messages') },
  ];

  const handleCreatePrivate = async () => {
    setError('');
    setLoadingRoom('private');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/create-with-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Store code in local storage or state to show in next page
      localStorage.setItem('lastCreatedRoomCode', data.room.roomCode);
      showToast(`PRIVATE HUB CREATED: ${data.room.roomCode}`, 'success');
      navigate(`/room/${data.room._id}`);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoadingRoom(null);
    }
  };

  const handleJoinPrivate = async (code) => {
    if (!code || code.length !== 4) {
      setError("Please enter a valid 4-digit code.");
      return;
    }
    setError('');
    setLoadingRoom('private');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/join-with-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast("Joining Secret Hub...", "success");
      setTimeout(() => navigate(`/room/${data.room._id}`), 500);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoadingRoom(null);
    }
  };


  return (
    <div style={{ padding: '40px 0', width: '100%', color: 'var(--text-main)' }}>
      <div style={{ padding: '0 40px', marginBottom: '40px' }}>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', padding: '16px', background: 'rgba(var(--accent-rgb), 0.1)', border: '1px solid var(--accent-primary)', borderRadius: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '16px',
        width: '100%' 
      }}>

        {rooms.map(room => (
          <RoomCard key={room.id} {...room} isLoading={loadingRoom === room.id} />
        ))}
      </div>

      {/* WiFi Scanning Radar Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
              zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <motion.div
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  border: '2px solid var(--accent-primary)', borderRadius: '50%'
                }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  border: '2px solid transparent', borderTopColor: 'var(--accent-primary)', borderRadius: '50%'
                }}
              />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                color: 'var(--accent-primary)'
              }}>
                <Wifi size={48} />
              </div>
            </div>
            <p style={{ 
              marginTop: '32px', fontFamily: 'var(--font-mono)', fontSize: '1.2rem', 
              letterSpacing: '2px', color: 'var(--accent-primary)', textTransform: 'uppercase' 
            }}>
              {scanningStatus}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No WiFi Message */}
      <AnimatePresence>
        {noWifiPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
              zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <div className="glass" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center' }}>
              <AlertCircle size={64} color="var(--accent-primary)" style={{ margin: '0 auto 24px' }} />
              <h2 style={{ fontFamily: 'var(--fh)', fontSize: '2rem', marginBottom: '16px' }}>OFFLINE DETECTED</h2>
              <p style={{ opacity: 0.7, marginBottom: '32px' }}>Please connect to a WiFi network to discover local Peers.</p>
              <button 
                onClick={() => setNoWifiPopup(false)}
                className="interactive hover-lift"
                style={{
                  width: '100%', padding: '16px', background: 'var(--accent-primary)',
                  border: 'none', color: '#fff', borderRadius: '8px', 
                  fontFamily: 'var(--fh)', fontSize: '1.2rem', letterSpacing: '2px', cursor: 'pointer'
                }}
              >
                GOT IT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result & Input Modal Override */}
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
                  {activeModalType === 'wifi-entry' && `WIFI DISCOVERY`}
                  {activeModalType === 'uni' && `UNIVERSITY CONNECT`}
                  {activeModalType === 'nearby' && `NEARBY (2km Radius)`}
                  {activeModalType === 'private-entry' && `PRIVATE HUB`}
                </h2>

                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Specific SSID Entry Box */}
                {activeModalType === 'wifi-entry' && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                     <p style={{ marginBottom: '24px', opacity: 0.8 }}>Confirm your current WiFi name to find peer networks:</p>
                     <input 
                       autoFocus
                       type="text" 
                       placeholder="e.g. Campus_WiFi_5G"
                       value={tempSsid}
                       onChange={(e) => setTempSsid(e.target.value)}
                       style={{
                         width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                         borderRadius: '8px', padding: '16px', color: '#fff', fontSize: '1.2rem',
                         fontFamily: 'var(--font-mono)', textAlign: 'center', marginBottom: '24px', outline: 'none'
                       }}
                     />
                     <button 
                       onClick={() => performWifiSearch(tempSsid)}
                       style={{
                         width: '100%', padding: '16px', background: 'var(--accent-primary)',
                         border: 'none', color: '#fff', borderRadius: '8px', 
                         fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px', cursor: 'pointer'
                       }}
                     >
                       START DISCOVERY
                     </button>
                  </div>
                )}

                {/* Private Hub Entry */}
                {activeModalType === 'private-entry' && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Create Option */}
                    <div className="glass" style={{ padding: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                      <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', marginBottom: '12px' }}>NEW ANONYMOUS HUB</h3>
                      <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '24px' }}>System generates a unique link for you and your Peers.</p>
                      <button 
                        onClick={handleCreatePrivate}
                        disabled={loadingRoom === 'private'}
                        style={{
                          width: '100%', padding: '14px', background: 'var(--accent-primary)',
                          border: 'none', color: '#fff', borderRadius: '8px', 
                          fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '2px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        {loadingRoom === 'private' ? <Loader2 className="spin" size={20} /> : <Plus size={20} />}
                        GENERATE VOID LINK
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.3 }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--text-main)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>OR</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--text-main)' }} />
                    </div>

                    {/* Join Option */}
                    <div className="glass" style={{ padding: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                      <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', marginBottom: '12px' }}>JOIN EXISTING PEER</h3>
                      <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '24px' }}>Enter the 4-digit code provided by your Peer.</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                          type="text" 
                          maxLength={4}
                          placeholder="CODE"
                          value={privateCode}
                          onChange={(e) => setPrivateCode(e.target.value.replace(/\D/g,''))}
                          style={{
                            width: '40%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                            borderRadius: '8px', padding: '14px', color: '#fff', fontSize: '1.5rem',
                            fontFamily: 'var(--font-mono)', textAlign: 'center', outline: 'none'
                          }}
                        />
                        <button 
                          onClick={() => handleJoinPrivate(privateCode)}
                          style={{
                            flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '8px', 
                            fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '2px', cursor: 'pointer'
                          }}
                        >
                          JOIN PEER
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                {activeModalType !== 'wifi-entry' && activeModalType !== 'private-entry' && modalData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
                    <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--text-dim)' }} />
                    <p style={{ fontFamily: 'var(--font-mono)' }}>No active peers found on this network.</p>
                  </div>
                ) : (
                  activeModalType !== 'wifi-entry' && modalData.map(r => (
                    <div key={r._id} style={{ 
                      padding: '20px', border: '1px solid var(--glass-border)', borderRadius: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', letterSpacing: '1px' }}>{r.name}</h4>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          <span style={{ color: 'var(--accent-primary)' }}>PEERS ONLINE: {r.members ? r.members.length : 0}</span>
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
                         <LogIn size={18} /> JOIN PEERS
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
                    <Plus size={20} /> CREATE NEW NETWORK HUB
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            style={{
              position: 'fixed', top: '100px', right: '32px', zIndex: 2000,
              background: 'var(--bg-panel)', border: '1px solid var(--accent-primary)',
              padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', gap: '16px'
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
               <Plus size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px' }}>SYSTEM NOTIFICATION</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{toast.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

    </div>
  );
};

export default Rooms;
