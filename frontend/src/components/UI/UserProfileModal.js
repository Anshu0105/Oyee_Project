import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Clock, Zap, Network, CalendarDays } from 'lucide-react';
import { BACKEND_URL } from '../../config';

const UserProfileModal = ({ userId, isOpen, onClose, token, currentUserId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setLoading(true);
    
    fetch(`${BACKEND_URL}/api/users/${userId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setProfile(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load identity profile:', err);
      setLoading(false);
    });
  }, [isOpen, userId, token]);

  const handleRelationship = async (type) => {
    try {
      await fetch(`${BACKEND_URL}/api/users/relationship/${userId}`, {
        method: 'POST',
        headers: { 
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      // Locally reflect relationship update
      if (profile) {
        setProfile({...profile, currentRelation: type});
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)'
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.9, opacity: 0 }}
          style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--glass-border)',
            padding: '32px',
            borderRadius: '16px',
            width: '100%', maxWidth: '400px',
            position: 'relative',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-inter)'
          }}
          className="glass hover-lift"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
             <X size={24} />
          </button>
          
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>Loading Node Data...</div>
          ) : profile ? (
            <>
              {/* Header Box */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '3rem', background: 'var(--bg-light)', display: 'inline-block', padding: '16px', borderRadius: '50%', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
                  {profile.avatarEmoji}
                </div>
                <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '2px', lineHeight: 1 }}>
                  {profile.auraName.toUpperCase()} {profile.equippedBadge}
                </h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: profile.isOnline ? 'var(--accent-green)' : 'var(--text-dim)', marginTop: '8px' }}>
                  {profile.isOnline ? '● ONLINE' : '○ OFFLINE'}
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Zap size={18} color="var(--accent-primary)" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>WEEKLY POTENTIAL</div>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', color: 'var(--accent-green)' }}>+{profile.weeklyAuraGain} AURA</div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Network size={18} color="#4299e1" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>MUTUAL FRIENDS</div>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem' }}>{profile.mutualFriends}</div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Clock size={18} color="#ecc94b" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>LAST SIGNAL</div>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                    {profile.isOnline ? 'NOW' : new Date(profile.lastActive || profile.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <CalendarDays size={18} color="#8c52ff" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>INITIALIZATION</div>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {currentUserId !== profile._id && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleRelationship('friend')}
                    className="interactive hover-lift"
                    style={{ 
                      flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                      background: profile.currentRelation === 'friend' ? 'var(--bg-main)' : 'var(--accent-green)', 
                      border: profile.currentRelation === 'friend' ? '1px solid var(--accent-green)' : 'none', 
                      borderRadius: '8px', color: profile.currentRelation === 'friend' ? 'var(--accent-green)' : '#000', 
                      fontFamily: 'var(--font-bebas)', fontSize: '1.3rem', letterSpacing: '2px', cursor: 'pointer' 
                    }}
                  >
                    <UserPlus size={20} /> {profile.currentRelation === 'friend' ? 'FRIENDED' : 'ADD FRIEND'}
                  </button>
                  <button 
                    onClick={() => handleRelationship('enemy')}
                    className="interactive hover-lift"
                    style={{ 
                      flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                      background: profile.currentRelation === 'enemy' ? 'var(--bg-main)' : 'var(--accent-primary)', 
                      border: profile.currentRelation === 'enemy' ? '1px solid var(--accent-primary)' : 'none', 
                      borderRadius: '8px', color: profile.currentRelation === 'enemy' ? 'var(--accent-primary)' : '#fff', 
                      fontFamily: 'var(--font-bebas)', fontSize: '1.3rem', letterSpacing: '2px', cursor: 'pointer' 
                    }}
                  >
                    <X size={20} /> {profile.currentRelation === 'enemy' ? 'MARKED ENEMY' : 'MARK ENEMY'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-primary)' }}>Identity Corrupted</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
