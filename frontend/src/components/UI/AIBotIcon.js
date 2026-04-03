import React from 'react';
import { motion } from 'framer-motion';

const AIBotIcon = ({ onClick }) => {
  return (
    <motion.div 
      onClick={onClick}
      className="ai-bot-container interactive"
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0], transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.85, rotate: -15 }}
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        filter: 'drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.3))'
      }}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Glow Effect Layer */}
        <path 
          d="M20 50 Q20 20 50 20 Q80 20 80 50 L80 80 Q70 70 60 80 Q50 90 40 80 Q30 70 20 80 Z" 
          fill="none" 
          stroke="var(--accent-primary)" 
          strokeWidth="12" 
          strokeLinejoin="round"
          style={{ opacity: 0.1, filter: 'blur(4px)' }}
        />
        
        {/* Ghost Body (Sharp) */}
        <path 
          d="M20 50 Q20 20 50 20 Q80 20 80 50 L80 80 Q70 70 60 80 Q50 90 40 80 Q30 70 20 80 Z" 
          fill="none" 
          stroke="var(--accent-primary)" 
          strokeWidth="6" 
          strokeLinejoin="round"
          style={{ opacity: 1 }}
        />
        
        {/* Eyes (Glowing Matrix Style) */}
        <motion.circle 
          cx="38" cy="45" r="5" 
          fill="var(--accent-primary)"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.circle 
          cx="62" cy="45" r="5" 
          fill="var(--accent-primary)"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
      </svg>
    </motion.div>
  );
};

export default AIBotIcon;
