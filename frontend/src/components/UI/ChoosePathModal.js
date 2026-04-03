import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, PlusCircle } from 'lucide-react';

const ChoosePathModal = ({ isOpen, onClose, onJoin, onCreate }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              width: '100%',
              maxWidth: '450px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '24px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(0,0,0,0.5)'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '4px', marginBottom: '8px', color: '#fff' }}>CHOOSE YOUR PATH</h2>
            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '32px' }}>Will you join the existing collective or manifest your own void?</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <button
                className="interactive"
                onClick={onJoin}
                style={{
                  padding: '30px 20px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <Users size={32} color="var(--accent-primary)" />
                </div>
                <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>JOIN A ROOM</span>
              </button>

              <button
                className="interactive"
                onClick={onCreate}
                style={{
                  padding: '30px 20px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <PlusCircle size={32} color="var(--accent-primary)" />
                </div>
                <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>CREATE ROOM</span>
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                marginTop: '32px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                letterSpacing: '1px',
                fontWeight: '600'
              }}
            >
              CANCEL
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChoosePathModal;
