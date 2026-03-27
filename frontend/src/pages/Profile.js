import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const mockFriends = [
  { id: 1, name: 'Crunchy Mango', tier: 'thunder', aura: 672 },
  { id: 2, name: 'Spicy Ramen', tier: 'none', aura: 198 },
  { id: 3, name: 'Fluffy Pancake', tier: 'star', aura: 1247 },
  { id: 4, name: 'Zesty Lemon', tier: 'none', aura: 88 },
];

const pricingOptions = [
  { days: 1, price: 49, impressions: '~500' },
  { days: 3, price: 99, impressions: '~1,500' },
  { days: 7, price: 199, impressions: '~4,000' },
];

const Profile = () => {
  const { user } = useUser();
  const [selectedPricing, setSelectedPricing] = useState(1);
  const [promoText, setPromoText] = useState('');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#111111',
      padding: '40px 32px',
      fontFamily: 'var(--font-inter)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '3.5rem',
          letterSpacing: '4px',
          color: '#111111',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          PROFILE
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: '#888888',
          letterSpacing: '1px',
        }}>
          // your anonymous identity
        </p>
        <div style={{ width: '48px', height: '3px', background: '#8c1a30', marginTop: '10px', borderRadius: '2px' }} />
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
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              border: '2px solid #8c1a30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-bebas)',
              fontSize: '2.5rem',
              color: '#8c1a30',
              marginBottom: '16px'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '2rem',
              letterSpacing: '2px',
              color: '#111111',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              {user.name}
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#888888',
            }}>
              // anon@university.edu
            </p>
          </div>

          {/* Aura Points Card */}
          <div style={{
            background: '#0d0408',
            border: '1px solid #2a1520',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background lightning bolt faint icon */}
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '40px',
              fontSize: '6rem',
              color: '#8c1a30',
              opacity: 0.1,
              fontFamily: 'var(--font-bebas)'
            }}>
              ⚡
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>
              AURA POINTS
            </p>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '4rem', color: '#ffffff', lineHeight: 1, marginBottom: '24px' }}>
              {user.aura}
            </div>

            {/* Progress Bar */}
            <div style={{ position: 'relative', height: '4px', background: '#331118', marginBottom: '12px' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min((user.aura / 1000) * 100, 100)}%`,
                background: '#8c1a30'
              }} />
            </div>
            
            {/* Tiers line */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: '#888',
              marginBottom: '24px'
            }}>
              <span>0</span>
              <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>⚡ 500</span>
              <span>⭐ 1000</span>
            </div>

            <div style={{ height: '1px', background: '#2a1520', margin: '16px 0' }} />

            {/* Modifiers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginBottom: '16px' }}>
              <div><span style={{ color: '#5cb85c' }}>AuraPlus+++</span> <span style={{ color: '#5cb85c', marginLeft: '8px' }}>+7 pts</span></div>
              <div><span style={{ color: '#8c1a30' }}>AuraMinus---</span> <span style={{ color: '#8c1a30', marginLeft: '8px' }}>-3 pts</span></div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#8cc4ff' }}>
              <span style={{ color: '#f7c948' }}>⚡ Thunder at 500+</span>
              <span style={{ color: '#f7c948' }}>⭐ Star at 1000+</span>
            </div>
          </div>

          {/* Recent Rooms */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '1.4rem',
              letterSpacing: '2px',
              color: '#8c1a30',
              marginBottom: '16px'
            }}>
              RECENT ROOMS
            </h3>
            <div style={{
              background: '#0d0408',
              border: '1px solid #2a1520',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#555' }}>
                Join a room to see your history
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* CONNECTIONS CARD */}
          <div style={{
            background: '#0d0408',
            border: '1px solid #2a1520',
            padding: '32px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '2rem',
              letterSpacing: '2px',
              color: '#ffffff',
              marginBottom: '24px'
            }}>
              CONNECTIONS
            </h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #2a1520', marginBottom: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '1.1rem',
                letterSpacing: '1px',
                color: '#8c1a30',
                paddingBottom: '8px',
                borderBottom: '2px solid #8c1a30',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1rem' }}>👥</span> FRIENDS (4)
              </div>
              <div style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '1.1rem',
                letterSpacing: '1px',
                color: '#888888',
                paddingBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1rem' }}>💀</span> ENEMIES (2)
              </div>
            </div>

            {/* Friends List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {mockFriends.map((f, i) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5cb85c' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#dddddd', fontWeight: 'bold' }}>
                      {f.name}
                    </span>
                    {f.tier === 'thunder' && <span style={{ color: '#f7c948', fontSize: '0.9rem' }}>⚡</span>}
                    {f.tier === 'star' && <span style={{ color: '#f7c948', fontSize: '0.9rem' }}>⭐</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#888888' }}>
                    {f.aura.toLocaleString()} aura
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PROMOTE CARD */}
          <div style={{
            background: '#0d0408',
            border: '1px solid #2a1520',
            padding: '32px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '2rem',
              letterSpacing: '2px',
              color: '#8c1a30',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ color: '#f7c948' }}>📣</span> PROMOTE
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#888888',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              Reach the entire OYEEE community. Promotions run live on the ticker and in rooms. Text and emojis only. Secure payment — no refunds after publishing.
            </p>

            <textarea 
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              placeholder="Write your promotional message here.. emojis welcome 🔥✨🦄"
              style={{
                width: '100%',
                height: '80px',
                background: '#15060b',
                border: '1px solid #2a1520',
                padding: '16px',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none',
                marginBottom: '8px'
              }}
            />
            
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#555555',
              marginBottom: '24px'
            }}>
              {promoText.length}/160 characters - No links - No phone numbers
            </p>

            {/* Pricing Options */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {pricingOptions.map(opt => (
                <div 
                  key={opt.days}
                  onClick={() => setSelectedPricing(opt.days)}
                  style={{
                    border: selectedPricing === opt.days ? '1px solid #8c1a30' : '1px solid #2a1520',
                    background: selectedPricing === opt.days ? '#1a070e' : 'transparent',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', color: '#ffffff', marginBottom: '4px' }}>
                    {opt.days} DAY{opt.days > 1 ? 'S' : ''}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#aaaaaa', marginBottom: '4px' }}>
                    ₹{opt.price}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#555555' }}>
                    {opt.impressions} impressions
                  </div>
                </div>
              ))}
            </div>

            <button style={{
              width: '100%',
              background: '#8c1a30',
              color: '#ffffff',
              border: 'none',
              padding: '16px',
              fontFamily: 'var(--font-bebas)',
              fontSize: '1.2rem',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#c42850'}
            onMouseLeave={e => e.currentTarget.style.background = '#8c1a30'}
            >
              PAY & PROMOTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
