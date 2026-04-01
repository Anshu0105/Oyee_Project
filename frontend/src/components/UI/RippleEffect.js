import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RippleEffect = ({ active, onComplete, originX, originY }) => {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ 
            position: 'fixed',
            top: originY || 0,
            left: originX || 0,
            width: 0,
            height: 0,
            background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9999,
            transform: 'translate(-50%, -50%)',
            opacity: 0.8
          }}
          animate={{
            width: '250vmax',
            height: '250vmax',
            opacity: 0,
            borderWidth: '0px'
          }}
          transition={{
            duration: 1.0,
            ease: [0.19, 1, 0.22, 1]
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default RippleEffect;
