import React from 'react';

const LiveDeclaration = () => {
  const messages = [
    "⚠ NO LINKS · NO PHONE NUMBERS · NO REAL NAMES",
    "VIOLATION = INSTANT BAN",
    "AURA IS EVERYTHING",
    "YOUR NAME IS A FOOD",
    "YOUR SECRETS ARE SAFE",
    "OYEEE - THE VOID IS OPEN"
  ];

  return (
    <div className="live-declaration glass" style={{
      height: '32px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid var(--glass-border)',
      background: 'rgba(0,0,0,0.3)',
      color: 'var(--accent-secondary)',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '2px'
    }}>
      <div className="marquee" style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        animation: 'marquee 40s linear infinite'
      }}>
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} style={{ margin: '0 40px' }}>{msg}</span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default LiveDeclaration;
