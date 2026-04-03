import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { X, Check, MessageSquare, UserPlus, Users } from 'lucide-react';

const InboxModal = ({ isOpen, onClose }) => {
  const { notifications, markNotificationsRead } = useUser();

  const getIcon = (type) => {
    switch (type) {
      case 'mention': return <MessageSquare size={16} className="text-blue-400" />;
      case 'friend': return <UserPlus size={16} className="text-green-400" />;
      case 'enemy': return <Users size={16} className="text-red-400" />;
      case 'dm': return <MessageSquare size={16} className="text-purple-400" />;
      default: return <Check size={16} />;
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Mark all as read when opened
      markNotificationsRead();
    }
  }, [isOpen]);

  const handleMarkAll = () => {
    markNotificationsRead();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="glass"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '320px',
            maxHeight: '450px',
            marginTop: '12px',
            zIndex: 2000,
            background: 'var(--bg-panel)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid var(--glass-border)', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '1px', fontSize: '1.2rem' }}>VOID INBOX</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleMarkAll}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
              >
                // CLEAR ALL
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={18} /></button>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem', fontStyle: 'italic' }}>
                Your void is currently silent...
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => markNotificationsRead(notif._id)}
                  className="interactive"
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '4px',
                    background: notif.isRead ? 'transparent' : 'rgba(255,255,255,0.03)',
                    border: '1px solid transparent',
                    borderColor: notif.isRead ? 'transparent' : 'rgba(var(--accent-rgb), 0.1)',
                    display: 'flex',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'rgba(0,0,0,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${notif.isRead ? 'var(--glass-border)' : 'var(--accent-primary)'}`
                  }}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: notif.isRead ? 'var(--text-dim)' : 'var(--text-main)' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', marginTop: '4px' }} />
                  )}
                </div>
              ))
            )}
          </div>
          
          <div style={{ padding: '10px', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.65rem', opacity: 0.4, background: 'rgba(0,0,0,0.1)' }}>
             End of Void Log
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InboxModal;
