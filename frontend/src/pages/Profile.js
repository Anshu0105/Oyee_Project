import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, Shield, Palette, Zap, Users, Megaphone, Smile, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

const avatars = ['👤', '👽', '🤖', '👻', '🐱', '🎭'];
const themePalettes = [
  { id: 'wine', name: 'WINE PURPLE', color: '#e91e63' },
  { id: 'blue', name: 'CROWN BLUE', color: '#4facfe' },
  { id: 'neon', name: 'NEON GREEN', color: '#39ff14' },
  { id: 'gold', name: 'DAZZLING GOLD', color: '#f7c948' },
  { id: 'cyber', name: 'CYBER ORANGE', color: '#ff8c00' }
];

const Profile = () => {
  const { user, token, logout } = useUser();
  const { setTheme, theme: currentTheme } = useTheme();
  const [promoText, setPromoText] = useState('');
  const [friends, setFriends] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/api/users/me/social`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setFriends(data.friends || []);
      setEnemies(data.enemies || []);
    })
    .catch(err => console.error("Failed to load social graph:", err));
  }, [token]);

  const displayedConnections = activeTab === 'friends' ? friends : enemies;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      padding: '40px 32px',
      fontFamily: 'var(--font-inter)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '3.5rem',
              letterSpacing: '4px',
              color: 'var(--text-main)',
              lineHeight: 1,
              marginBottom: '8px',
            }}>
              IDENTITY PANEL
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--text-dim)',
              letterSpacing: '1px',
            }}>
              // CUSTOMIZE YOUR ANONYMOUS MANIFESTATION
            </p>
          </div>
          <button 
            onClick={logout}
            className="interactive"
            style={{
              padding: '12px 24px',
              background: 'rgba(233, 30, 99, 0.1)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '8px',
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-bebas)',
              fontSize: '1rem',
              letterSpacing: '2px',
              cursor: 'pointer'
            }}
          >
            LOG OUT
          </button>
        </div>
        <div style={{ width: '48px', height: '3px', background: 'var(--accent-primary)', marginTop: '10px', borderRadius: '2px' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 420px) 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Identity Card */}
          <div className="glass" style={{ padding: '40px', border: '1px solid var(--glass-border)', position: 'relative' }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.03)',
              border: '2px solid var(--accent-primary)',
              boxShadow: '0 0 20px rgba(233, 30, 99, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              marginBottom: '24px',
              borderRadius: '24px'
            }}>
              {user.avatarEmoji}
            </div>
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '2px', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              {user.name}
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', margin: 0 }}>
              // {user.email}
            </p>
          </div>

          {/* Aura Points Card - Fixed Deposit Concept */}
          <div className="glass" style={{
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--glass-border)',
            background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(0,0,0,0) 100%)'
          }}>
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '10px',
              fontSize: '8rem',
              color: 'var(--accent-primary)',
              opacity: 0.05,
              fontFamily: 'var(--font-bebas)',
              pointerEvents: 'none'
            }}>
              VOID
            </div>

            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>
                SPENDABLE BALANCE (LIQUID)
              </p>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '4rem', color: 'var(--text-main)', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                {user.spendableAura || 0} <span style={{ fontSize: '1rem', opacity: 0.5 }}>⚡</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '2px', margin: 0 }}>
                  LIFETIME EARNED (FIXED)
                </p>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user.lifetimeAura || 0}</span>
              </div>
              <div style={{ position: 'relative', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.min(((user.lifetimeAura || 0) / (user.maxLifetimeAura || 1)) * 100, 100)}%`,
                  background: 'var(--accent-primary)',
                  borderRadius: '2px'
                }} />
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.65rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>FLOOR PROTECTION:</span>
                <span style={{ fontSize: '0.7rem', color: '#5ec87a', fontWeight: 'bold' }}>10% OF PEAK</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                {Math.floor((user.maxLifetimeAura || 0) * 0.1)} ⚡ <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>(RESTRICTED WITHDRAWAL)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* CUSTOMIZATION CARD */}
          <div className="glass" style={{ padding: '32px', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={28} /> CUSTOMIZATION
            </h2>

            {/* Avatar Selection */}
            <div style={{ marginBottom: '40px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
                <Smile size={14} /> SELECT AVATAR EMOJI
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {avatars.map(emoji => (
                  <button
                    key={emoji}
                    className="interactive"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: user.avatarEmoji === emoji ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div style={{ marginBottom: '40px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
                <Palette size={14} /> SELECT THEME PALETTE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {themePalettes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className="interactive"
                    style={{
                      padding: '16px',
                      background: currentTheme === t.id ? t.color : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${currentTheme === t.id ? t.color : 'var(--glass-border)'}`,
                      borderRadius: '12px',
                      color: currentTheme === t.id ? '#000' : t.color,
                      fontFamily: 'var(--font-bebas)',
                      fontSize: '1rem',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s'
                    }}
                  >
                    {t.name}
                    {currentTheme === t.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Graph */}
          <div className="glass" style={{ padding: '32px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
              <button 
                onClick={() => setActiveTab('friends')}
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                  color: activeTab === 'friends' ? 'var(--accent-primary)' : 'var(--text-dim)',
                  paddingBottom: '12px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'friends' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  cursor: 'pointer'
                }}>
                FRIENDS ({friends.length})
              </button>
              <button 
                onClick={() => setActiveTab('enemies')}
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                  color: activeTab === 'enemies' ? 'var(--accent-primary)' : 'var(--text-dim)',
                  paddingBottom: '12px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'enemies' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  cursor: 'pointer'
                }}>
                ENEMIES ({enemies.length})
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayedConnections.length === 0 ? (
                 <div style={{ opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>// NO PEERS DISCOVERED</div>
              ) : displayedConnections.map(peer => (
                <div key={peer._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.2rem' }}>{peer.avatarEmoji}</div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 'bold' }}>{peer.auraName}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{peer.spendableAura || 0} ⚡</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
