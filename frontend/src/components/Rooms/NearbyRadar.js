import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, LogIn } from 'lucide-react';

const NearbyRadar = ({ userCoords, rooms, onJoin }) => {
  const radius = 150; // SVG half-width
  const maxDistanceKm = 2; // Radar represents 2km radius

  const getCoordinates = (room) => {
    if (!room.location || !room.location.coordinates) return null;
    const [lon, lat] = room.location.coordinates;
    const [userLon, userLat] = [userCoords.lng, userCoords.lat];

    // Simple projection for small distances (2km)
    const dLat = lat - userLat;
    const dLon = (lon - userLon) * Math.cos(userLat * Math.PI / 180);

    // 1 degree lat is approx 111km
    const dy = dLat * 111;
    const dx = dLon * 111;

    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Scale to radar radius
    const scale = radius / maxDistanceKm;
    
    // If distance > maxDistance, we clip it to the edge
    const r = Math.min(distance * scale, radius - 10);
    const angle = Math.atan2(dy, dx);

    return {
      x: radius + r * Math.cos(angle),
      y: radius - r * Math.sin(angle),
      distance: distance.toFixed(2)
    };
  };

  return (
    <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto' }}>
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
        {/* Radar Rings */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle 
            key={i}
            cx="150" cy="150" r={radius * scale}
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="1"
            style={{ opacity: 0.1 * (i+1) }}
          />
        ))}

        {/* Radar Crosshair Lines */}
        <line x1="0" y1="150" x2="300" y2="150" stroke="var(--accent-primary)" style={{ opacity: 0.1 }} />
        <line x1="150" y1="0" x2="150" y2="300" stroke="var(--accent-primary)" style={{ opacity: 0.1 }} />

        {/* Radar Sweep Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(var(--accent-rgb), 0.1) 90deg, transparent 91deg)',
            borderRadius: '50%', pointerEvents: 'none', zIndex: 1
          }}
        />

        {/* User Centered Blip */}
        <circle cx="150" cy="150" r="4" fill="var(--accent-primary)" />
        <motion.circle 
          cx="150" cy="150" r="8" fill="var(--accent-primary)"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Room Blips */}
        {rooms.map((room) => {
          const coords = getCoordinates(room);
          if (!coords) return null;

          return (
            <g key={room._id} style={{ cursor: 'pointer' }} onClick={() => onJoin(room._id)}>
              <Tooltip text={`${room.name} (${coords.distance}km)`}>
                <motion.circle 
                  cx={coords.x} cy={coords.y} r="6" fill="var(--accent-primary)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.5, filter: 'drop-shadow(0 0 8px var(--accent-primary))' }}
                />
                <motion.circle 
                  cx={coords.x} cy={coords.y} r="12" fill="var(--accent-primary)"
                  animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: Math.random() }}
                />
              </Tooltip>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Tooltip = ({ text, children }) => (
  <g className="radar-tooltip-group">
    {children}
    <foreignObject x="-50" y="-30" width="100" height="20" className="radar-tooltip">
      <div style={{
        background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '10px',
        padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap',
        pointerEvents: 'none', opacity: 0, transition: 'opacity 0.2s',
        fontFamily: 'var(--font-mono)', border: '1px solid var(--accent-primary)'
      }}>
        {text}
      </div>
    </foreignObject>
    <style>{`
      .radar-tooltip-group:hover .radar-tooltip div { opacity: 1 !important; }
    `}</style>
  </g>
);

export default NearbyRadar;
