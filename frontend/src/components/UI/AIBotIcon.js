import React from 'react';

const AIBotIcon = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="ai-bot-container interactive"
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Ghost Body (Original Shape) */}
        <path 
          d="M20 50 Q20 20 50 20 Q80 20 80 50 L80 80 Q70 70 60 80 Q50 90 40 80 Q30 70 20 80 Z" 
          fill="none" 
          stroke="var(--accent-primary)" 
          strokeWidth="6" 
          strokeLinejoin="round"
          style={{ opacity: 0.8 }}
        />
        
        {/* Eyes (Solid) */}
        <circle cx="38" cy="45" r="5" fill="var(--accent-primary)" />
        <circle cx="62" cy="45" r="5" fill="var(--accent-primary)" />
      </svg>
    </div>
  );
};

export default AIBotIcon;
