import React, { useState, useEffect } from 'react';
import { Bot, X, Shield, MessageSquare, MapPin, Trash2, Check, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { safeFetch } from '../../config';

const BotPanel = ({ isOpen, onClose, currentRoomId }) => {
  const { user, token } = useUser();
  const [activeTab, setActiveTab] = useState('summary'); // summary, nearby, flagged
  const [data, setData] = useState({ summary: '', nearby: '', flagged: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (user.role === 'admin') setActiveTab('flagged');
      else setActiveTab('summary');
      fetchData();
    }
  }, [isOpen, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'summary' && currentRoomId) {
        const res = await safeFetch(`/api/rooms/summarize/${currentRoomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(prev => ({ ...prev, summary: res.summary }));
      } else if (activeTab === 'nearby') {
        // Mocking location for nearby summary
        const res = await safeFetch('/api/rooms/nearby/summary', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: 21.0, lng: 85.0 }) // Fallback co-ords
        });
        setData(prev => ({ ...prev, nearby: res.summary }));
      } else if (activeTab === 'flagged' && user.role === 'admin') {
        const res = await safeFetch('/api/messages/flagged', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(prev => ({ ...prev, flagged: res }));
      }
    } catch (err) {
      console.error("Bot data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (msgId, action) => {
    try {
        if (action === 'approve') {
            await safeFetch(`/api/messages/${msgId}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } else {
            await safeFetch(`/api/messages/${msgId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        fetchData();
    } catch(err) {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, height: '70vh',
              background: '#0a0a0a', borderTop: '1px solid var(--accent-primary)',
              zIndex: 1001, borderRadius: '32px 32px 0 0', padding: '32px',
              boxShadow: '0 -20px 40px rgba(255,0,85,0.1)', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '48px', height: '48px', background: 'rgba(255,0,85,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Bot size={28} />
                   </div>
                   <div>
                      <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', margin: 0 }}>OYEEE AI BOT</h2>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>// COGNITIVE VOID ASSISTANT</p>
                   </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={32} /></button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                <Tab icon={MessageSquare} label="UNREAD SUMMARY" active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
                <Tab icon={MapPin} label="NEARBY ACTIVITY" active={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} />
                {user.role === 'admin' && <Tab icon={Shield} label="FLAGGED (ADMIN)" active={activeTab === 'flagged'} onClick={() => setActiveTab('flagged')} />}
            </div>

            {/* Content */}
            <div style={{ height: 'calc(100% - 150px)', overflowY: 'auto', paddingRight: '12px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>// DECODING FREQUENCIES...</div>
                ) : (
                    activeTab === 'summary' ? (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                             <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', lineHeight: '1.8', color: '#fff' }}>
                                {data.summary || "No chatter detected in this sector."}
                             </div>
                        </div>
                    ) : activeTab === 'nearby' ? (
                        <div style={{ background: 'rgba(255,0,85,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,0,85,0.1)' }}>
                            <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', color: 'var(--accent-primary)', marginBottom: '12px' }}>15KM RADIUS INSIGHT:</p>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#fff', opacity: 0.8 }}>
                                {data.nearby || "Scanning nearby frequencies..."}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {data.flagged.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px', opacity: 0.4 }}>No active violations detected.</div>
                            ) : data.flagged.map(msg => (
                                <div key={msg._id} className="glass" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#ff4d4d' }}>{msg.user}</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>IN {msg.roomId}</span>
                                            <span style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem' }}>{msg.flagReason || 'FLAGGED'}</span>
                                        </div>
                                        <div style={{ color: '#ff4d4d', fontWeight: '500' }}>"{msg.text}"</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => handleAction(msg._id, 'approve')} style={{ background: 'rgba(72,187,120,0.1)', color: '#48bb78', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}><Check size={20} /></button>
                                        <button onClick={() => handleAction(msg._id, 'delete')} style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Tab = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} style={{
        background: 'none', border: 'none', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '12px',
        color: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)', cursor: 'pointer',
        borderBottom: active ? '3px solid var(--accent-primary)' : '3px solid transparent',
        transition: 'all 0.3s', fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px'
    }}>
        <Icon size={18} />
        {label}
    </button>
);

export default BotPanel;
