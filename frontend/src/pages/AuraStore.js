import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Package, ShoppingBag, Zap, CheckCircle } from 'lucide-react';

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

  const handleClaim = async (item) => {
    const isClaimed = user.claimedItems?.includes(item.id.toString());
    if (isClaimed) return;
    
    if (user.aura < item.price) {
      showToast(`Not enough aura! You need ${item.price - user.aura} more pts.`, 'error');
      return;
    }

    try {
      // Assuming updateAura handles both local state and backend
      // But we also need to call addClaimedItem
      await updateAura(-item.price);
      await addClaimedItem(item.id.toString());
      showToast(`✅ ${item.name} claimed! Check your profile.`, 'success');
    } catch (err) {
      showToast('Error claiming item. Try again.', 'error');
    }
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      padding: '100px 32px 40px', // Pad top to prevent Navbar overlap
      fontFamily: 'var(--font-inter)',
      position: 'relative',
      scrollBehavior: 'smooth'
    }}>
      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: toast.type === 'error' ? 'var(--accent-primary)' : 'var(--bg-panel)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.3s ease',
            border: `1px solid var(--glass-border)`,
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
          color: 'var(--text-main)',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          AURA STORE
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
        }}>
          // spend your earned aura · real oyeee merch
        </p>
        <div style={{ width: '48px', height: '3px', background: 'var(--accent-primary)', marginTop: '10px', borderRadius: '2px' }} />
      </div>

      {/* Aura Balance Banner */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg-panel)',
        color: 'var(--text-main)',
        borderRadius: '12px',
        padding: '12px 24px',
        marginBottom: '40px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem',
        border: '1px solid var(--glass-border)'
      }}>
        <span style={{ color: 'var(--text-dim)' }}>BALANCE:</span>
        <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.6rem', color: '#f7c948', letterSpacing: '2px' }}>
          {user.aura}
        </span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>⚡</span>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '32px',
        maxWidth: '1200px',
      }}>
        {storeItems.map(item => (
          <div
            key={item.id}
            className="glass"
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            {/* Emoji Display Area */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '160px',
              fontSize: '4.5rem',
            }}>
              {item.emoji}
            </div>

            {/* Card Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '1.6rem',
                letterSpacing: '2px',
                color: 'var(--text-main)',
              }}>
                {item.name}
              </h2>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
                lineHeight: '1.6',
                flex: 1,
              }}>
                {item.description}
              </p>

              {/* Price + Claim Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                    {item.price}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>
                    AURA
                  </span>
                </div>

                <button
                  onClick={() => handleClaim(item)}
                  disabled={user.claimedItems?.includes(item.id.toString())}
                  className="interactive"
                  style={{
                    background: user.claimedItems?.includes(item.id.toString()) ? 'rgba(255,255,255,0.1)' : 'var(--accent-primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontFamily: 'var(--font-bebas)',
                    fontSize: '1rem',
                    letterSpacing: '1.5px',
                    cursor: user.claimedItems?.includes(item.id.toString()) ? 'default' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: user.claimedItems?.includes(item.id.toString()) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {user.claimedItems?.includes(item.id.toString()) ? <CheckCircle size={14} /> : <ShoppingBag size={14} />}
                  {user.claimedItems?.includes(item.id.toString()) ? 'CLAIMED' : 'CLAIM'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
