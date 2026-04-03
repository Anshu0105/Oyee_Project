import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import InboxModal from './InboxModal';
import { motion } from 'framer-motion';

const InboxIcon = () => {
  const { notifications } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const iconRef = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (iconRef.current && !iconRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="inbox-container" ref={iconRef} style={{ position: 'relative' }}>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="interactive"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: unreadCount > 0 ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.6)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          padding: '0'
        }}
      >
        {/* Custom Premium Signal/Inbox Icon */}
        <svg 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ filter: unreadCount > 0 ? 'drop-shadow(0 0 5px var(--accent-primary))' : 'none' }}
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
          {unreadCount > 0 && (
            <motion.circle 
              cx="18" cy="6" r="3" 
              fill="var(--accent-primary)" 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              stroke="none"
            />
          )}
        </svg>

        {/* Pulse Aura for unread */}
        {unreadCount > 0 && (
          <motion.div 
            animate={{ 
              boxShadow: ['0 0 0px var(--accent-primary)', '0 0 15px var(--accent-primary)', '0 0 0px var(--accent-primary)'] 
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '12px',
              border: '1px solid var(--accent-primary)',
              opacity: 0.6,
              pointerEvents: 'none'
            }} 
          />
        )}
      </motion.button>

      <InboxModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default InboxIcon;
