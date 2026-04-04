import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Plus, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeFetch } from '../../config';
import { useUser } from '../../context/UserContext';

const PrivateRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { token } = useUser();
  const [step, setStep] = useState('CHOOSE'); // CHOOSE, CREATE, JOIN, SUCCESS
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Create Room State
  const [createData, setCreateData] = useState({
    name: '',
    description: '',
    max_users: 30
  });

  // Join Room State
  const [joinCode, setJoinCode] = useState('');

  const reset = () => {
    setStep('CHOOSE');
    setLoading(false);
    setError('');
    setCreateData({ name: '', description: '', max_users: 30 });
    setJoinCode('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await safeFetch('/api/rooms/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(createData)
      });
      navigate(`/room/${data.room.room_code}`);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (joinCode.length !== 10) {
      setError('Room ID must be 10 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await safeFetch('/api/rooms/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ room_code: joinCode })
      });
      navigate(`/room/${data.room.room_code}`);
      handleClose();
    } catch (err) {
      setError(err.message || 'Room not found or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)', zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '450px', background: '#111',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px',
              padding: '40px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
            }}
          >
            <button 
              onClick={handleClose}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', opacity: 0.3, cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            {step === 'CHOOSE' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', background: 'rgba(255,0,85,0.1)', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', color: '#FF0055', margin: '0 auto 24px'
                }}>
                  <Lock size={28} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '12px' }}>CHOOSE YOUR PATH</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '32px', lineHeight: 1.5 }}>
                  Will you join an existing collective or manifest your own void?
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <OptionButton 
                    icon={ArrowRight} 
                    label="JOIN A ROOM" 
                    onClick={() => setStep('JOIN')} 
                    primary
                  />
                  <OptionButton 
                    icon={Plus} 
                    label="CREATE ROOM" 
                    onClick={() => setStep('CREATE')} 
                  />
                </div>
              </div>
            )}

            {step === 'CREATE' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '24px' }}>MANIFEST VOID</h2>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.5, letterSpacing: '1px' }}>ROOM NAME</label>
                    <input 
                      required
                      placeholder="e.g. Midnight Vibez"
                      value={createData.name}
                      onChange={e => setCreateData({...createData, name: e.target.value})}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.5, letterSpacing: '1px' }}>DESCRIPTION</label>
                    <textarea 
                      placeholder="What is this void about?"
                      value={createData.description}
                      onChange={e => setCreateData({...createData, description: e.target.value})}
                      style={{ ...inputStyle, height: '80px', resize: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.5, letterSpacing: '1px' }}>MAX USERS</label>
                    <select 
                      value={createData.max_users}
                      onChange={e => setCreateData({...createData, max_users: parseInt(e.target.value)})}
                      style={inputStyle}
                    >
                      <option value={30}>30 Users</option>
                      <option value={50}>50 Users</option>
                      <option value={100}>100 Users</option>
                    </select>
                  </div>

                  {error && <p style={{ color: '#FF0055', fontSize: '0.8rem', fontWeight: '600' }}>{error}</p>}

                  <button 
                    disabled={loading}
                    type="submit" 
                    style={primaryButtonStyle}
                  >
                    {loading ? 'MANIFESTING...' : 'CREATE ROOM'}
                  </button>
                  <p onClick={() => setStep('CHOOSE')} style={{ textAlign: 'center', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.5 }}>Cancel</p>
                </form>
              </div>
            )}

            {step === 'JOIN' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '24px' }}>ENTER THE VOID</h2>
                <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.5, letterSpacing: '1px' }}>ROOM ID</label>
                    <input 
                      required
                      placeholder="e.g. A9xT3kP8Qz"
                      maxLength={10}
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                      style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem' }}
                    />
                  </div>

                  {error && <p style={{ color: '#FF0055', fontSize: '0.8rem', fontWeight: '600' }}>{error}</p>}

                  <button 
                    disabled={loading}
                    type="submit" 
                    style={primaryButtonStyle}
                  >
                    {loading ? 'CONNECTING...' : 'JOIN ROOM'}
                  </button>
                  <p onClick={() => setStep('CHOOSE')} style={{ textAlign: 'center', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.5 }}>Back</p>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const OptionButton = ({ icon: Icon, label, onClick, primary }) => (
  <motion.button
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px', borderRadius: '16px', border: primary ? 'none' : '1px solid rgba(255,255,255,0.05)',
      background: primary ? '#FF0055' : 'rgba(255,255,255,0.03)',
      color: '#fff', cursor: 'pointer', outline: 'none'
    }}
  >
    <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '1px' }}>{label}</span>
    <Icon size={20} opacity={0.6} />
  </motion.button>
);

const inputStyle = {
  width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
  color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s'
};

const primaryButtonStyle = {
  width: '100%', padding: '16px', background: '#FF0055', color: '#fff',
  border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem',
  cursor: 'pointer', boxShadow: '0 10px 20px rgba(255,0,85,0.2)',
  letterSpacing: '1px'
};

export default PrivateRoomModal;
