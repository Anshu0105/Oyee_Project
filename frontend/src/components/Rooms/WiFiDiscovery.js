import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Activity, Terminal, ShieldAlert } from 'lucide-react';

const WiFiDiscovery = ({ status, onComplete }) => {
  const [logs, setLogs] = useState([
    'INITIALIZING_VOID_SCAN...',
    'DETECTING_NEARBY_NODES...',
  ]);

  const mockLogs = [
    'SIGNAL_STRENGTH: 88dBm',
    'HANDSHAKE_INITIATED...',
    'BYPASSING_VOID_ENCRYPTION...',
    'SSID_SIGNATURE_CAPTURED...',
    'MAC_ADDRESS_FILTERED...',
    'VOID_NODE_ACTIVE',
    'CHRONO_SYNC_COMPLETE'
  ];

  useEffect(() => {
    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < mockLogs.length) {
        setLogs(prev => [...prev.slice(-6), mockLogs[logIdx]]);
        logIdx++;
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)',
        zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px'
      }}
    >
      {/* Immersive Scan Frame */}
      <div style={{ 
        position: 'relative', width: '320px', height: '320px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {/* Radar Background Rings */}
        {[100, 70, 40].map((size, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              width: `${size}%`,
              height: `${size}%`,
              border: '1px solid rgba(var(--accent-rgb), 0.15)',
              borderRadius: '50%',
            }}
          />
        ))}

        {/* The Scanning Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          style={{
            position: 'absolute', width: '100%', height: '100%',
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(var(--accent-rgb), 0.2) 60deg, transparent 61deg)',
            borderRadius: '50%',
          }}
        />

        {/* Central Core */}
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Wifi size={64} color="var(--accent-primary)" />
          </motion.div>
          {/* Glitch Overlay for Core */}
          <motion.div 
            animate={{ opacity: [0, 0.5, 0], x: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 1.5 }}
            style={{ position: 'absolute', top: 0, left: 0, color: '#ff00ff', zIndex: -1 }}
          >
            <Wifi size={64} />
          </motion.div>
        </div>

        {/* Active Node Blips */}
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          style={{ position: 'absolute', top: '20%', left: '70%', width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-primary)' }}
        />
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 2.2 }}
          style={{ position: 'absolute', bottom: '30%', left: '20%', width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-primary)' }}
        />
      </div>

      {/* Terminal Feed */}
      <div style={{ 
        marginTop: '60px', width: '100%', maxWidth: '400px', 
        background: 'rgba(255,255,255,0.02)', padding: '24px', 
        border: '1px solid var(--glass-border)', borderRadius: '12px',
        fontFamily: 'var(--font-mono)', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '0.75rem', opacity: 0.7 }}>
          <Terminal size={14} />
          <span>VOID_NETWORK_DISCOVERY v1.0.4 - ACTIVE_SCAN</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <AnimatePresence mode="popLayout">
            {logs.map((log, idx) => (
              <motion.div
                key={log + idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1 - (logs.length - idx) * 0.15, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{ fontSize: '0.85rem', letterSpacing: '1px', display: 'flex', gap: '12px' }}
              >
                <span style={{ color: 'var(--accent-primary)', opacity: 0.5 }}>[{idx.toString().padStart(2, '0')}]</span>
                <span style={{ color: idx === logs.length - 1 ? 'var(--accent-primary)' : 'var(--text-main)' }}>{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <p style={{ 
          fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', 
          letterSpacing: '3px', color: 'var(--accent-primary)', textShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)' 
        }}>
          {status}
        </p>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '12px' }}>
          {[0, 1, 2].map(i => (
             <motion.div 
               key={i}
               animate={{ opacity: [0.2, 1, 0.2] }}
               transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
               style={{ width: '4px', height: '4px', background: 'var(--accent-primary)', borderRadius: '50%' }}
             />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WiFiDiscovery;
