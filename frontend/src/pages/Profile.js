import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, Shield, Palette, Zap, Users, Megaphone } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

const calculateTier = (aura) => {
  if (aura > 1000) return 'STARBORN';
  if (aura > 500) return 'THUNDER';
  if (aura > 200) return 'RISING';
  return 'GHOST';
}

const pricingOptions = [
  { days: 1, price: 49, impressions: '~500' },
  { days: 3, price: 99, impressions: '~1,500' },
  { days: 7, price: 199, impressions: '~4,000' },
];

const Profile = () => {
  const { user, token } = useUser();
  const { setTheme, theme: currentTheme } = useTheme();
  const [selectedPricing, setSelectedPricing] = useState(1);
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
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '3.5rem',
          letterSpacing: '4px',
          color: 'var(--text-main)',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          PROFILE
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
        }}>
          // your anonymous identity
        </p>
        <div style={{ width: '48px', height: '3px', background: 'var(--accent-primary)', marginTop: '10px', borderRadius: '2px' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 380px) 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Identity Box */}
          <div className="glass" style={{ padding: '32px', border: '1px solid var(--glass-border)' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-bebas)',
              fontSize: '2.5rem',
              color: 'var(--accent-primary)',
              marginBottom: '16px',
              borderRadius: '50%'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '2.2rem',
              letterSpacing: '2px',
              color: 'var(--text-main)',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              {user.name}
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
            }}>
              // {user.email || 'anon@university.edu'}
            </p>
          </div>

          {/* Aura Points Card */}
          <div className="glass" style={{
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{
              position: 'absolute',
              right: '-10px',
              top: '10px',
              fontSize: '6rem',
              color: 'var(--accent-primary)',
              opacity: 0.1,
              fontFamily: 'var(--font-bebas)',
              pointerEvents: 'none'
            }}>
              ⚡
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>
              AURA POINTS
            </p>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '4.5rem', color: 'var(--text-main)', lineHeight: 1, marginBottom: '24px' }}>
              {user.aura}
            </div>

            {/* Progress Bar */}
            <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px', borderRadius: '3px' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min((user.aura / 1000) * 100, 100)}%`,
                background: 'var(--accent-primary)',
                borderRadius: '3px',
                boxShadow: '0 0 10px var(--accent-primary)'
              }} />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--text-dim)',
              marginBottom: '24px'
            }}>
              <span>0</span>
              <span style={{ color: 'var(--accent-primary)' }}>⚡ 500 (THUNDER)</span>
              <span>⭐ 1000 (STARBORN)</span>
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <span style={{ color: 'var(--accent-green)' }}>AuraPlus+++</span>
                 <span style={{ color: 'var(--accent-primary)' }}>AuraMinus---</span>
              </div>
            </div>
          </div>

          {/* Recent Rooms */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '1.4rem',
              letterSpacing: '2px',
              color: 'var(--accent-primary)',
              marginBottom: '16px'
            }}>
              RECENT ACTIVITY
            </h3>
            <div className="glass" style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px solid var(--glass-border)'
            }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Your history is auto-deleted every 24h
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* SETTINGS CARD */}
          <div className="glass" style={{
            padding: '32px',
            border: '1px solid var(--glass-border)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '2rem',
              letterSpacing: '2px',
              color: 'var(--text-main)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Settings size={28} className="spin-hover" /> SETTINGS
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px', letterSpacing: '1px' }}>
                    <Palette size={14} /> THEME SELECTION
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                     <button 
                       onClick={() => setTheme('wine')}
                       className="interactive"
                       style={{
                         flex: 1,
                         padding: '16px',
                         background: currentTheme === 'wine' ? 'var(--accent-primary)' : 'rgba(233, 30, 99, 0.1)',
                         border: `1px solid ${currentTheme === 'wine' ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                         borderRadius: '8px',
                         color: currentTheme === 'wine' ? 'white' : 'var(--accent-primary)',
                         fontFamily: 'var(--font-bebas)',
                         fontSize: '1.1rem',
                         letterSpacing: '1px',
                         cursor: 'pointer',
                         transition: 'all 0.3s'
                       }}
                     >
                        WINE-PURPLE
                     </button>
                     <button 
                       onClick={() => setTheme('blue')}
                       className="interactive"
                       style={{
                         flex: 1,
                         padding: '16px',
                         background: currentTheme === 'blue' ? 'var(--accent-primary)' : 'rgba(245, 196, 0, 0.1)',
                         border: `1px solid ${currentTheme === 'blue' ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                         borderRadius: '8px',
                         color: currentTheme === 'blue' ? 'var(--bg-main)' : 'var(--accent-primary)',
                         fontFamily: 'var(--font-bebas)',
                         fontSize: '1.1rem',
                         letterSpacing: '1px',
                         cursor: 'pointer',
                         transition: 'all 0.3s'
                       }}
                     >
                        CROWN-BLUE
                     </button>
                  </div>
               </div>
               
               <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                   * Theme selection is saved to your local device. 
                   Consistent across all pages of the void.
                 </p>
               </div>
            </div>
          </div>

          {/* CONNECTIONS CARD */}
          <div className="glass" style={{
            padding: '32px',
            border: '1px solid var(--glass-border)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '2rem',
              letterSpacing: '2px',
              color: 'var(--text-main)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Users size={28} /> CONNECTIONS
            </h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
              <div 
                className="interactive"
                onClick={() => setActiveTab('friends')}
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  color: activeTab === 'friends' ? 'var(--accent-primary)' : 'var(--text-dim)',
                  paddingBottom: '8px',
                  borderBottom: activeTab === 'friends' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                FRIENDS ({friends.length})
              </div>
              <div 
                className="interactive"
                onClick={() => setActiveTab('enemies')}
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  color: activeTab === 'enemies' ? 'var(--accent-primary)' : 'var(--text-dim)',
                  paddingBottom: '8px',
                  borderBottom: activeTab === 'enemies' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                ENEMIES ({enemies.length})
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {displayedConnections.length === 0 ? (
                 <div style={{ opacity: 0.4, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>Void links empty...</div>
              ) : displayedConnections.map((f, i) => {
                const tier = calculateTier(f.aura);
                return (
                  <div key={f._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '1.2rem', filter: activeTab === 'enemies' ? 'grayscale(100%) opacity(0.5)' : 'none' }}>{f.avatarEmoji}</div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: activeTab === 'enemies' ? 'var(--accent-primary)' : 'var(--text-main)', fontWeight: 'bold' }}>
                        {f.auraName}
                      </span>
                      {tier === 'THUNDER' && <span style={{ color: '#f7c948', fontSize: '0.9rem' }}>⚡</span>}
                      {tier === 'STARBORN' && <span style={{ color: '#8c52ff', fontSize: '0.9rem' }}>⭐</span>}
                      {f.equippedBadge && <span style={{ fontSize: '0.9rem' }}>{f.equippedBadge}</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {f.aura.toLocaleString()} aura
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROMOTE CARD */}
          <div className="glass" style={{
            padding: '32px',
            border: '1px solid var(--glass-border)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '2rem',
              letterSpacing: '2px',
              color: 'var(--accent-primary)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Megaphone size={28} /> PROMOTE
            </h2>
            <textarea 
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              placeholder="Write your promotional message here.. emojis welcome 🔥✨"
              style={{
                width: '100%',
                height: '80px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                padding: '16px',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none',
                marginBottom: '8px',
                borderRadius: '8px'
              }}
            />
            <button className="interactive" style={{
              width: '100%',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              padding: '16px',
              fontFamily: 'var(--font-bebas)',
              fontSize: '1.2rem',
              letterSpacing: '2px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'all 0.3s'
            }}>
              PAY & PROMOTE
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .spin-hover:hover {
           transform: rotate(180deg);
           transition: transform 0.6s ease;
        }
      `}</style>
    </div>
  );
};

export default Profile;
