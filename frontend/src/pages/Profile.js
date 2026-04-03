import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Trash2, Shield, Palette, Zap, Users, LogOut, Check, X, AlertTriangle, Settings } from 'lucide-react';
import { safeFetch } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
  { id: 'wine', name: 'WINE PURPLE', color: '#FF0055' },
  { id: 'blue', name: 'CROWN BLUE', color: '#4299e1' },
  { id: 'green', name: 'NEON GREEN', color: '#48bb78' },
  { id: 'gold', name: 'DAZZLING GOLD', color: '#ecc94b' },
  { id: 'orange', name: 'CYBER ORANGE', color: '#ed8936' }
];

const emojis = ['👤', '👽', '🤖', '👻', '🐱', '🎭'];

const DeleteModal = ({ onConfirm, onCancel }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      style={{
        background: '#121212', border: '1px solid rgba(255,0,0,0.3)', padding: '40px',
        borderRadius: '32px', width: '100%', maxWidth: '450px', textAlign: 'center',
        boxShadow: '0 0 50px rgba(255,0,0,0.1)'
      }}
    >
      <div style={{ 
        width: '80px', height: '80px', background: 'rgba(255,0,0,0.1)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d4d',
        margin: '0 auto 24px'
      }}>
        <AlertTriangle size={40} />
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '16px', fontFamily: 'var(--font-bebas)', letterSpacing: '1px' }}>ERASE IDENTITY?</h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
        This will permanently delete your aura, friends, enemies, and all data from the void. <strong>This action cannot be undone.</strong>
      </p>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={onCancel}
          style={{ 
            flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', border: 'none', 
            borderRadius: '16px', color: '#fff', fontWeight: '700', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem'
          }}
        >
          CANCEL
        </button>
        <button 
          onClick={onConfirm}
          style={{ 
            flex: 1, padding: '16px', background: '#ff4d4d', border: 'none', 
            borderRadius: '16px', color: '#fff', fontWeight: '900', cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(255,77,77,0.2)', fontFamily: 'var(--font-bebas)',
            fontSize: '1.1rem', letterSpacing: '1px'
          }}
        >
          CONFIRM DELETE
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const Profile = () => {
  const { user, token, logoutUser, deleteAccount, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoadingSocial(true);
    safeFetch('/api/users/me/social', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(data => {
      setFriends(data.friends || []);
      setEnemies(data.enemies || []);
    })
    .catch(err => console.error("Social graph failed:", err))
    .finally(() => setLoadingSocial(false));
  }, [token]);

  const handleUpdate = async (updates) => {
    try {
      await updateProfile(updates);
    } catch(err) {
      console.error("Update failed:", err);
    }
  };

  const displayedConnections = activeTab === 'friends' ? friends : enemies;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '40px 64px',
      fontFamily: 'var(--font-inter)',
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '4rem', letterSpacing: '4px', margin: 0, lineHeight: 0.9 }}>
            IDENTITY PANEL
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: '12px', letterSpacing: '2px', opacity: 0.8 }}>
            // CUSTOMIZE YOUR ANONYMOUS MANIFESTATION
          </p>
          <div style={{ width: '60px', height: '3px', background: 'var(--accent-primary)', marginTop: '8px' }} />
        </div>
        <button 
          onClick={logoutUser}
          className="interactive hover-lift"
          style={{ 
            background: 'none', border: '1px solid rgba(255,0,85,0.4)', color: 'var(--accent-primary)',
            padding: '10px 24px', borderRadius: '8px', fontFamily: 'var(--font-bebas)', fontSize: '1.1rem',
            letterSpacing: '1px', opacity: 0.8
          }}
        >
          LOG OUT
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '48px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: IDENTITY & STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Identity Box */}
          <div className="glass" style={{ padding: '40px 32px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
            <div style={{
                width: '100px', height: '100px', background: 'rgba(255,0,85,0.05)', border: '2px solid var(--accent-primary)',
                borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', marginBottom: '24px', boxShadow: '0 0 30px rgba(255,0,85,0.1)'
            }}>
                {user.avatarEmoji}
            </div>
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '2px', margin: 0 }}>
                {user.name}
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.8rem', opacity: 0.5 }}>//</p>
          </div>

          {/* Balance/Stats Box */}
          <div className="glass" style={{ 
            padding: '40px 32px', borderRadius: '24px', position: 'relative', overflow: 'hidden',
            border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)'
          }}>
            <div style={{ position: 'absolute', right: '-20px', top: '20px', fontSize: '12rem', fontWeight: '900', opacity: 0.03, color: 'white', pointerEvents: 'none', fontFamily: 'var(--font-bebas)' }}>
                VOID
            </div>
            
            <div style={{ marginBottom: '32px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '8px' }}>SPENDABLE BALANCE (LIQUID)</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontSize: '5rem', fontWeight: '900', fontFamily: 'var(--font-bebas)', lineHeight: 1 }}>{user.aura}</span>
                    <Zap size={24} fill="var(--accent-primary)" color="var(--accent-primary)" />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>LIFETIME EARNED (FIXED)</span>
                    <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>{user.aura}</span>
                </div>
            </div>

            <div style={{ marginTop: '40px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>FLOOR PROTECTION:</span>
                    <span style={{ fontSize: '0.65rem', color: '#48bb78', fontWeight: '800' }}>10% OF PEAK</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>0</span>
                    <Zap size={10} fill="#ffffff" color="transparent" />
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>(RESTRICTED WITHDRAWAL)</span>
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMIZATION & CONNECTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* Customization Section */}
          <div className="glass" style={{ padding: '48px', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.2rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                <Settings size={28} /> CUSTOMIZATION
            </h3>

            {/* Avatar Emojis */}
            <div style={{ marginBottom: '48px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} /> SELECT AVATAR EMOJI
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {emojis.map(e => (
                        <button 
                            key={e}
                            onClick={() => handleUpdate({ avatarEmoji: e })}
                            className="interactive"
                            style={{
                                width: '60px', height: '60px', background: user.avatarEmoji === e ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '1.8rem',
                                transition: 'all 0.3s', boxShadow: user.avatarEmoji === e ? '0 0 20px rgba(255,0,85,0.2)' : 'none'
                            }}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme Palette */}
            <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={14} /> SELECT THEME PALETTE
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {themes.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => handleUpdate({ theme: t.id })}
                            className="interactive hover-lift"
                            style={{
                                padding: '16px 20px', background: user.theme === t.id ? t.color : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${user.theme === t.id ? t.color : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '12px', color: user.theme === t.id ? '#ffffff' : t.color,
                                fontFamily: 'var(--font-bebas)', fontSize: '1.1rem', letterSpacing: '1px',
                                textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                boxShadow: user.theme === t.id ? `0 0 20px ${t.color}33` : 'none'
                            }}
                        >
                            {t.name}
                            {user.theme === t.id && <Check size={16} />}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          {/* Connections Section */}
          <div className="glass" style={{ padding: '48px', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
             <div style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                <button 
                   onClick={() => setActiveTab('friends')}
                   style={{
                       background: 'none', border: 'none', padding: '0 0 16px', fontFamily: 'var(--font-bebas)', 
                       fontSize: '1.8rem', letterSpacing: '2px', color: activeTab === 'friends' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)',
                       borderBottom: activeTab === 'friends' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                       transition: 'all 0.3s', cursor: 'pointer'
                   }}
                >
                    FRIENDS ({friends.length})
                </button>
                <button 
                   onClick={() => setActiveTab('enemies')}
                   style={{
                       background: 'none', border: 'none', padding: '0 0 16px', fontFamily: 'var(--font-bebas)', 
                       fontSize: '1.8rem', letterSpacing: '2px', color: activeTab === 'enemies' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)',
                       borderBottom: activeTab === 'enemies' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                       transition: 'all 0.3s', cursor: 'pointer'
                   }}
                >
                    ENEMIES ({enemies.length})
                </button>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loadingSocial ? (
                    <div style={{ opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textAlign: 'center', padding: '24px' }}>// LOADING PEERS...</div>
                ) : displayedConnections.length === 0 ? (
                    <div style={{ opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textAlign: 'center', padding: '24px' }}>// NO PEERS DISCOVERED</div>
                ) : (
                    displayedConnections.map(peer => (
                        <div key={peer._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{peer.avatarEmoji || '👤'}</span>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{peer.auraName || peer.username}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: '800' }}>
                                <span>{peer.aura}</span>
                                <Zap size={14} fill="currentColor" />
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>

          {/* Danger Zone */}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
             <button 
                onClick={() => setShowDeleteModal(true)}
                className="interactive"
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,77,77,0.4)', fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', display: 'inline-flex',
                  alignItems: 'center', gap: '8px'
                }}
             >
                <Trash2 size={14} /> DELETE MY IDENTITY
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal 
            onConfirm={async () => {
                await deleteAccount();
                setShowDeleteModal(false);
            }} 
            onCancel={() => setShowDeleteModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
