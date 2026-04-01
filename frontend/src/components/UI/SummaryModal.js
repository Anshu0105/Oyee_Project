import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare, History } from 'lucide-react';

const SummaryModal = ({ isOpen, onClose, summary, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 999
            }}
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'hidden',
              background: '#0a0a0a', /* Deep Dark Theme */
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '32px',
              zIndex: 1000,
              boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles size={24} color="var(--accent-primary)" />
                <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px', color: 'var(--text-main)' }}>AI QUICK SUMMARY</h2>
              </div>
              <button 
                onClick={onClose}
                className="interactive hover-lift"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  color: 'white', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer' 
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Context Subtitle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              <History size={14} />
              <span>Analyzing the last 60 minutes of conversation...</span>
            </div>
            
            {/* Content Body */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              color: 'var(--text-main)', 
              lineHeight: '1.6',
              fontFamily: 'var(--font-inter)',
              fontSize: '1rem'
            }}>
              {isLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  >
                    <Sparkles size={40} color="var(--accent-primary)" />
                  </motion.div>
                  <p style={{ opacity: 0.6 }}>Our AI ghost is reading the transcripts...</p>
                </div>
              ) : summary ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {summary.split('\n').map((line, idx) => (
                      <p key={idx} style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '12px 16px', 
                        borderRadius: '12px',
                        borderLeft: '3px solid var(--accent-primary)'
                      }}>
                        {line}
                      </p>
                    ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px 0' }}>
                  <MessageSquare size={48} style={{ margin: '0 auto 16px' }} />
                  <p>No significant conversations found in the last hour.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SummaryModal;
