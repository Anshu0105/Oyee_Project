import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Package, ShoppingBag, Zap, CheckCircle, Shirt, Coffee, Ghost, Award } from 'lucide-react';

const storeItems = [
  {
    id: 1,
    name: 'OYEEE TEE',
    icon: Shirt,
    iconColor: '#5cb85c',
    description: 'Premium cotton tee with the iconic OYEEE wordmark. Wear the void on your chest.',
    price: 500,
    badge: null,
  },
  {
    id: 2,
    name: 'VOID MUG',
    icon: Coffee,
    iconColor: '#8B4513',
    description: 'Ceramic mug with OYEEE branding. Fill it with whatever fuels your chats.',
    price: 300,
    badge: null,
  },
  {
    id: 3,
    name: 'GHOST CAP',
    icon: Ghost,
    iconColor: '#4a90d9',
    description: 'Snapback cap embroidered with the OYEEE ghost mark. Represent anonymously.',
    price: 400,
    badge: null,
  },
  {
    id: 4,
    name: 'BAG BADGE',
    icon: Award,
    iconColor: '#FFD700',
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
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
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
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.02)',
              position: 'relative'
            }}
          >
            
            {/* Icon Display Area */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '180px',
              position: 'relative',
              overflow: 'hidden'
            }}>
               <div style={{
                 padding: '24px',
                 borderRadius: '50%',
                 background: 'rgba(255,255,255,0.03)',
                 border: '1px solid var(--glass-border)',
                 boxShadow: `0 0 20px ${item.iconColor}22`,
                 color: item.iconColor
               }}>
                 <item.icon size={56} strokeWidth={1.5} />
               </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '1.8rem',
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
                fontFamily: 'var(--font-inter)'
              }}>
                {item.description}
              </p>

              {/* Price + Claim Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', color: 'var(--accent-primary)' }}>
                    {item.price}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>
                    AURA
                  </span>
                </div>

                <button
                  onClick={() => handleClaim(item)}
                  disabled={user.claimedItems.some(i => i.id === item.id)}
                  className="neural-button"
                  style={{
                    background: user.claimedItems.some(i => i.id === item.id) ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                    color: user.claimedItems.some(i => i.id === item.id) ? 'var(--text-dim)' : 'var(--bg-main)',
                    opacity: user.claimedItems.some(i => i.id === item.id) ? 0.6 : 1,
                    padding: '8px 20px',
                    fontSize: '0.9rem'
                  }}
                >
                  {user.claimedItems.some(i => i.id === item.id) ? <CheckCircle size={16} /> : <ShoppingBag size={16} />}
                  {user.claimedItems.some(i => i.id === item.id) ? 'CLAIMED' : 'CLAIM'}
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
