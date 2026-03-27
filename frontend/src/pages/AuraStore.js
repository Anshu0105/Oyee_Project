import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const storeItems = [
  {
    id: 1,
    name: 'OYEEE TEE',
    emoji: '👕',
    emojiColor: '#5cb85c',
    description: 'Premium cotton tee with the iconic OYEEE wordmark. Wear the void on your chest.',
    price: 500,
    badge: null,
  },
  {
    id: 2,
    name: 'VOID MUG',
    emoji: '☕',
    emojiColor: '#8B4513',
    description: 'Ceramic mug with OYEEE branding. Fill it with whatever fuels your chats.',
    price: 300,
    badge: null,
  },
  {
    id: 3,
    name: 'GHOST CAP',
    emoji: '🧢',
    emojiColor: '#4a90d9',
    description: 'Snapback cap embroidered with the OYEEE ghost mark. Represent anonymously.',
    price: 400,
    badge: null,
  },
  {
    id: 4,
    name: 'BAG BADGE',
    emoji: '🏅',
    emojiColor: '#FFD700',
    description: 'Enamel pin badge, Thunder or Starborn variant — claim your tier in the real world.',
    price: 150,
    badge: null,
  },
];

const AuraStore = () => {
  const { user, updateAura, addClaimedItem } = useUser();
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleClaim = (item) => {
    if (user.claimedItems.some(i => i.id === item.id)) return;
    if (user.aura < item.price) {
      showToast(`Not enough aura! You need ${item.price - user.aura} more pts.`, 'error');
      return;
    }
    updateAura(-item.price);
    addClaimedItem(item);
    showToast(`✅ ${item.name} claimed! Check your profile.`, 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#111111',
      padding: '40px 32px',
      fontFamily: 'var(--font-inter)',
      position: 'relative',
    }}>
      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: toast.type === 'error' ? '#ff4444' : '#1a1a1a',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            animation: 'slideIn 0.3s ease',
            border: `1px solid ${toast.type === 'error' ? '#ff2222' : '#333'}`,
          }}>
            {toast.message}
          </div>
        ))}
      </div>

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
          AURA STORE
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: '#888888',
          letterSpacing: '1px',
        }}>
          // spend your earned aura · real oyeee merch
        </p>
        <div style={{ width: '48px', height: '3px', background: '#8c1a30', marginTop: '10px', borderRadius: '2px' }} />
      </div>

      {/* Aura Balance Banner */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: '#111111',
        color: '#ffffff',
        borderRadius: '10px',
        padding: '10px 20px',
        marginBottom: '36px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
      }}>
        <span style={{ color: '#aaaaaa' }}>YOUR BALANCE</span>
        <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', color: '#f7c948', letterSpacing: '2px' }}>
          {user.aura}
        </span>
        <span style={{ color: '#aaaaaa', fontSize: '0.7rem' }}>AURA PTS</span>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '24px',
        maxWidth: '1100px',
      }}>
        {storeItems.map(item => (
          <div
            key={item.id}
            style={{
              background: '#1a0a10',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #2a1520',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(140,26,48,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Emoji Display Area */}
            <div style={{
              background: '#120712',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '140px',
              fontSize: '4rem',
            }}>
              {item.emoji}
            </div>

            {/* Card Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '1.4rem',
                letterSpacing: '2px',
                color: '#ffffff',
              }}>
                {item.name}
              </h2>
              <p style={{
                fontSize: '0.8rem',
                color: '#aaaaaa',
                lineHeight: '1.5',
                flex: 1,
              }}>
                {item.description}
              </p>

              {/* Price + Claim Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', color: '#8c1a30' }}>
                    {item.price}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#888888', letterSpacing: '1px' }}>
                    AURA PTS
                  </span>
                </div>

                <button
                  onClick={() => handleClaim(item)}
                  disabled={user.claimedItems.some(i => i.id === item.id)}
                  style={{
                    background: user.claimedItems.some(i => i.id === item.id) ? '#333333' : '#8c1a30',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontFamily: 'var(--font-bebas)',
                    fontSize: '0.95rem',
                    letterSpacing: '1px',
                    cursor: user.claimedItems.some(i => i.id === item.id) ? 'default' : 'pointer',
                    transition: 'background 0.2s ease, transform 0.1s ease',
                    opacity: user.claimedItems.some(i => i.id === item.id) ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!user.claimedItems.some(i => i.id === item.id)) e.currentTarget.style.background = '#c42850'; }}
                  onMouseLeave={e => { if (!user.claimedItems.some(i => i.id === item.id)) e.currentTarget.style.background = '#8c1a30'; }}
                  onMouseDown={e => { if (!user.claimedItems.some(i => i.id === item.id)) e.currentTarget.style.transform = 'scale(0.95)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {user.claimedItems.some(i => i.id === item.id) ? 'CLAIMED ✓' : 'CLAIM'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insufficient aura note */}
      <p style={{
        marginTop: '40px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: '#999999',
        letterSpacing: '0.5px',
      }}>
        // earn more aura by chatting, reacting, and being based in any room
      </p>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default AuraStore;
