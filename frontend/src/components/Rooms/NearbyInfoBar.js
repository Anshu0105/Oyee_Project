import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Globe } from 'lucide-react';

const NearbyInfoBar = ({ rooms, onJoin }) => {
  if (!rooms || rooms.length === 0) return null;

  return (
    <div style={{
      width: '100%', borderTop: '1px solid var(--glass-border)',
      background: 'rgba(255,255,255,0.02)', padding: '16px 0',
      overflow: 'hidden', position: 'relative'
    }}>
      <motion.div
        animate={{ x: [0, -100 * rooms.length] }}
        transition={{ repeat: Infinity, duration: 10 + rooms.length * 5, ease: "linear" }}
        style={{ display: 'flex', gap: '32px', whiteSpace: 'nowrap' }}
      >
        {[...rooms, ...rooms].map((room, i) => (
          <div 
            key={`${room._id}-${i}`}
            className="interactive hover-lift"
            onClick={() => onJoin(room._id)}
            style={{
              padding: '12px 24px', background: 'var(--bg-panel)',
              border: '1px solid var(--glass-border)', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '16px',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(var(--accent-rgb), 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)', border: '1px solid var(--glass-border)'
            }}>
              <MapPin size={18} />
            </div>
            
            <div>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px' }}>{room.name}</div>
              <div style={{ 
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.6,
                display: 'flex', gap: '8px', alignItems: 'center' 
              }}>
                <Users size={12} color="var(--accent-primary)" />
                <span>{room.members?.length || 0} PEERS</span>
                <span style={{ color: 'var(--accent-primary)' }}>·</span>
                <Globe size={12} />
                <span>ONLINE NOW</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Decorative Gradient Overlays */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '60px', background: 'linear-gradient(90deg, var(--bg-main), transparent)', pointerEvents: 'none', zIndex: 2 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '60px', background: 'linear-gradient(-90deg, var(--bg-main), transparent)', pointerEvents: 'none', zIndex: 2 }} />
    </div>
  );
};

export default NearbyInfoBar;
