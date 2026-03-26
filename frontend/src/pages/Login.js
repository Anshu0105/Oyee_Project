import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate star fall stars
    const newStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: Math.random() * 100 + '%',
      delay: Math.random() * 5 + 's',
      duration: Math.random() * 3 + 2 + 's',
    }));
    setStars(newStars);
  }, []);

  const handleJoin = () => {
    navigate('/rooms');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-chat)',
      position: 'relative',
      overflow: 'hidden',
      color: 'white'
    }}>
      {/* Star Fall Background */}
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            width: star.size + 'px',
            height: star.size + 'px',
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}
        />
      ))}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        padding: '24px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'max(80px, 10vw)',
            letterSpacing: '12px',
            color: 'var(--accent-secondary)',
            textShadow: '0 0 30px var(--accent-primary)'
          }}>
            OYEEE<span>.</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '4px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '40px'
          }}>
            // OPEN · ANONYMOUS · ZERO-IDENTITY
          </p>

          <button
            onClick={handleJoin}
            className="interactive glass"
            style={{
              padding: '20px 48px',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--font-bebas)',
              fontSize: '1.5rem',
              letterSpacing: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            JOIN THE VOID
          </button>
        </motion.div>

        {/* About Section */}
        <div className="glass" style={{
          marginTop: '60px',
          maxWidth: '600px',
          padding: '32px',
          background: 'rgba(255,255,255,0.05)',
          textAlign: 'left'
        }}>
          <h2 style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent-secondary)', letterSpacing: '4px', marginBottom: '16px' }}>— ABOUT OYEEE —</h2>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>
            A radically open anonymous platform. No usernames. No histories. 
            Connect via university Wi-Fi, campus email, or by proximity. 
            Your identity is a food name. Your worth is your Aura. 
            Every message is a mystery.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
            {['Anonymous', 'WiFi Rooms', 'Uni Mail', 'GPS Rooms', 'Aura System', 'DM Friends'].map(tag => (
              <span key={tag} className="glass" style={{ 
                padding: '4px 12px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '2px', background: 'rgba(255,255,255,0.1)'
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
