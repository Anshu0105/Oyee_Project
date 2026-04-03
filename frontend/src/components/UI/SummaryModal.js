import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare, History } from 'lucide-react';

const SummaryModal = ({ isOpen, onClose, summary, isLoading, title = "AI QUICK SUMMARY" }) => {
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
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(60px) saturate(180%)',
              WebkitBackdropFilter: 'blur(60px) saturate(180%)',
              zIndex: 2999
            }}
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ scale: 0.95, opacity: 0, y: 20, filter: 'blur(10px)' }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.4 }
            }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '32px',
              zIndex: 3000,
              boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* High-end Shine Sweep */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                transform: 'skewX(-25deg)',
                pointerEvents: 'none'
              }}
            />
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles size={24} color="var(--accent-primary)" />
                <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px', color: 'var(--text-main)' }}>{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="interactive"
                style={{ 
                  background: 'rgba(var(--accent-rgb), 0.1)', 
                  border: '1px solid var(--accent-primary)', 
                  color: 'var(--accent-primary)', 
                  padding: '6px 16px',
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.2)'
                }}
              >
                <X size={14} />
                CANCEL
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

            {/* AI Growth Footer */}
            {!isLoading && (
              <div style={{ 
                marginTop: 'auto', 
                padding: '12px', 
                background: 'rgba(var(--accent-rgb), 0.05)', 
                borderRadius: '12px', 
                border: '1px solid rgba(var(--accent-rgb), 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff00', boxShadow: '0 0 5px #00ff00' }} />
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.6, letterSpacing: '1px' }}>
                  VOID INTELLIGENCE INDEXED: {(summary?.match(/\d+/g) || [0])[0]} PULSES
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SummaryModal;
