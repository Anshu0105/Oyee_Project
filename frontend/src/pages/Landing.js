import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Sparkles, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '../components/Layout/Navbar'; // Assuming we re-use the navbar as requested

const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.velocity = {
          x: (Math.random() - 0.5) * 0.5,
          y: Math.random() * 1.5 + 0.5
        };
        this.radius = Math.random() * 2;
        this.alpha = Math.random() * 0.5 + 0.1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }

      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.y > canvas.height) {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }

        this.draw();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.update());
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    style={{
      padding: '32px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 1,
      position: 'relative',
      backdropFilter: 'blur(10px)'
    }}
  >
    <div style={{ color: 'var(--accent-primary)' }}>
      <Icon size={32} />
    </div>
    <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', letterSpacing: '1px', color: '#fff' }}>{title}</h3>
    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '1rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>{desc}</p>
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <Particles />
      <Navbar /> {/* Preserved as per user instructions */}

      {/* Navigation matching user's specific text reqs, overlaying on Void */}
      <div style={{ 
        position: 'absolute', top: '24px', right: '48px', zIndex: 10,
        display: 'flex', gap: '32px', fontFamily: 'var(--font-inter)', fontSize: '0.9rem', alignItems: 'center'
      }}>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-dim)' }} className="hover-white">Home</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-dim)' }} className="hover-white">Features</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-dim)' }} className="hover-white">How It Works</span>
        <button 
          onClick={() => navigate('/auth')}
          style={{ 
            background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '10px 20px', 
            borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-inter)', fontWeight: 'bold'
          }}
          className="hover-lift"
        >
          Get Started <ArrowRight size={16} />
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 80px' }}>
        
        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: '120px', paddingTop: '80px' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ 
              fontFamily: 'var(--font-inter)', // Dropbox style clean typography
              fontWeight: 800,
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              marginBottom: '24px'
            }}
          >
            THE VOID IS OPEN
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '1.2rem',
              color: 'var(--text-dim)',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px'
            }}
          >
            One door. Infinite anonymity. Experience the true freedom of untraced communication across your campus.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button 
              onClick={() => navigate('/auth')}
              className="interactive hover-lift"
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '20px 40px',
                borderRadius: '8px',
                fontFamily: 'var(--font-inter)',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              ENTER THE VOID <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>

        {/* FEATURES GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          paddingBottom: '80px'
        }}>
          <FeatureCard 
            icon={Shield} 
            title="ANONYMOUS CHAT" 
            desc="No real names, no traces. Speak your mind freely without the burden of an identity." 
          />
          <FeatureCard 
            icon={Sparkles} 
            title="AURA SYSTEM" 
            desc="Earn points through positive interactions. Status is built in the void." 
          />
          <FeatureCard 
            icon={MapPin} 
            title="LOCATION-BASED" 
            desc="Find active peers nearby via secure GPS. Connect with people in your physical radius." 
          />
          <FeatureCard 
            icon={ShoppingBag} 
            title="EXCLUSIVE MERCH" 
            desc="Accumulate aura and spend it on real, physical gear distributed on campus." 
          />
        </div>
      </div>
      <style>{`
        .hover-white:hover { color: #fff !important; }
      `}</style>
    </div>
  );
};

export default Landing;
