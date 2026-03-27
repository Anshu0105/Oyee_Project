import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Packman = ({ mood = 'happy' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Eye tracking logic
  const leftEyeOffset = {
    x: (mousePos.x - (window.innerWidth - 60)) / 50,
    y: (mousePos.y - 60) / 50,
  };

  return (
    <div className="packman-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }}>
      <svg width="60" height="60" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}>
        {/* Packman Body - White Outline, Transparent Background */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="3" />
        
        {/* Mouth */}
        <motion.path
          d={mood === 'happy' ? "M 20 60 Q 50 85 80 60" : "M 20 75 Q 50 55 80 75"}
          fill="none"
          stroke="white"
          strokeWidth="3"
          animate={{ d: mood === 'happy' ? "M 20 60 Q 50 85 80 60" : "M 20 75 Q 50 55 80 75" }}
        />

        {/* Eye */}
        <g transform={`translate(${45 + Math.min(Math.max(leftEyeOffset.x, -10), 10)}, ${35 + Math.min(Math.max(leftEyeOffset.y, -10), 10)})`}>
          <circle cx="0" cy="0" r="8" fill="white" />
          <circle cx="0" cy="0" r="3" fill="black" />
        </g>
      </svg>
    </div>
  );
};

export default Packman;
