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
    <div className="live-declaration-container" style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      position: 'relative',
      zIndex: 900,
      background: 'var(--bg-panel)',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: '1px solid var(--glass-border)',
      height: '36px',

      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <div className="live-status-indicator" style={{
        backgroundColor: 'var(--bg-main)',
        height: '100%',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderRight: '1px solid var(--glass-border)',
        zIndex: 2,
        position: 'relative'
      }}>

        <span style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.7rem', 
          color: 'var(--accent-primary)', 
          letterSpacing: '2px',
          fontWeight: 'bold'
        }}>LIVE</span>
        <div className="live-dot" style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--accent-primary)',
          borderRadius: '50%',
          boxShadow: '0 0 10px var(--accent-primary)'
        }} />
      </div>

      <div className="marquee" style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        animation: 'marquee 40s linear infinite',
        flex: 1
      }}>
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} style={{ 
            margin: '0 40px',
            color: 'var(--accent-secondary)',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '1px'
          }}>{msg}</span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .live-dot {
          animation: pulse-pink 2s infinite;
        }
      `}</style>
    </div>
  );
};


export default LiveDeclaration;
