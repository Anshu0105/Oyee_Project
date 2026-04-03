import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, MapPin, Zap, Gift, ArrowRight, ChevronDown } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Anonymous Chat Rooms',
    desc: 'Connect with your campus completely anonymously. No real names, no traces.',
    color: '#e91e63'
  },
  {
    icon: Zap,
    title: 'Aura System',
    desc: 'Earn points with every interaction. Unlock rewards, climb the leaderboard.',
    color: '#f7c948'
  },
  {
    icon: MapPin,
    title: 'Location-Based Rooms',
    desc: 'Find people physically nearby using GPS clustering — like magic.',
    color: '#4facfe'
  },
  {
    icon: Gift,
    title: 'Exclusive Merch',
    desc: 'Spend your Aura on real OYEEE merchandise. The void rewards the active.',
    color: '#5ec87a'
  }
];

const STEPS = [
  { num: '01', title: 'Sign up with university email', desc: 'Only @cgu-odisha.ac.in members can enter.' },
  { num: '02', title: 'Get your anonymous aura name', desc: 'We generate a unique identity for you. No real names.' },
  { num: '03', title: 'Join rooms and start chatting', desc: 'WiFi rooms, GPS rooms, direct messages — all anonymous.' },
  { num: '04', title: 'Earn aura points, claim rewards', desc: 'Every interaction earns you Aura. Spend it in the store.' }
];

// Particle canvas component
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: -Math.random() * 0.5 - 0.2,
      alpha: Math.random()
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233, 30, 99, ${p.alpha * 0.6})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        p.alpha += (Math.random() - 0.5) * 0.02;
        p.alpha = Math.max(0.1, Math.min(1, p.alpha));
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const featuresRef = useRef(null);
  const howRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#0a0a0a', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #e91e63; border-radius: 2px; }
        .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; cursor: pointer; background: none; border: none; }
        .nav-link:hover { color: #fff; }
        .cta-btn { 
          background: #e91e63; color: #fff; border: none; 
          padding: 12px 28px; border-radius: 8px; font-weight: 700;
          font-size: 0.95rem; cursor: pointer; display: inline-flex;
          align-items: center; gap: 8px; transition: all 0.3s;
          letter-spacing: 0.5px;
        }
        .cta-btn:hover { background: #c41651; transform: scale(1.05); box-shadow: 0 8px 30px rgba(233,30,99,0.4); }
        .cta-btn-lg {
          background: #e91e63; color: #fff; border: none;
          padding: 18px 48px; border-radius: 10px; font-weight: 700;
          font-size: 1.1rem; cursor: pointer; display: inline-flex;
          align-items: center; gap: 12px; transition: all 0.3s;
          letter-spacing: 1px;
        }
        .cta-btn-lg:hover { background: #c41651; transform: scale(1.05); box-shadow: 0 12px 40px rgba(233,30,99,0.5); }
        .feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 32px; transition: all 0.3s;
        }
        .feature-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(233,30,99,0.3); transform: translateY(-4px); }
        .step-card {
          display: flex; gap: 24px; align-items: flex-start;
          padding: 28px; background: rgba(255,255,255,0.02);
          border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s;
        }
        .step-card:hover { border-color: rgba(233,30,99,0.2); background: rgba(233,30,99,0.03); }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .hero-headline { font-size: clamp(3rem, 10vw, 6rem) !important; }
          .footer-links { flex-direction: column; gap: 16px !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 40px', height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: '700', cursor: 'pointer', letterSpacing: '-0.5px' }}
        >
          OYEEE<span style={{ color: '#e91e63' }}>.</span>
        </div>

        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <button className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
          <button className="nav-link" onClick={() => scrollTo(featuresRef)}>Features</button>
          <button className="nav-link" onClick={() => scrollTo(howRef)}>How It Works</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="nav-link desktop-nav" onClick={() => navigate('/auth')}>Login</button>
          <button className="cta-btn" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight size={16} />
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(v => !v)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px' }}
          >
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: '#fff', borderRadius: '2px' }} />)}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          position: 'fixed', top: '68px', left: 0, right: 0, zIndex: 99,
          background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <button className="nav-link" style={{ textAlign: 'left', padding: '8px 0' }} onClick={() => { window.scrollTo({top:0,behavior:'smooth'}); setMenuOpen(false); }}>Home</button>
          <button className="nav-link" style={{ textAlign: 'left', padding: '8px 0' }} onClick={() => scrollTo(featuresRef)}>Features</button>
          <button className="nav-link" style={{ textAlign: 'left', padding: '8px 0' }} onClick={() => scrollTo(howRef)}>How It Works</button>
          <button className="cta-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={() => navigate('/auth')}>Get Started <ArrowRight size={16} /></button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <ParticleCanvas />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(233,30,99,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(233,30,99,0.1)', border: '1px solid rgba(233,30,99,0.3)', borderRadius: '100px', padding: '6px 16px', marginBottom: '32px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '2px', color: '#e91e63' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e91e63', animation: 'pulse 2s infinite' }} />
            NOW LIVE AT CGU ODISHA
          </div>

          <h1 className="hero-headline" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: '800', lineHeight: '0.95', letterSpacing: '-3px', marginBottom: '28px' }}>
            OYEEE<span style={{ color: '#e91e63' }}>.</span>
            <br />
            <span style={{ fontWeight: '300', fontSize: '0.6em', letterSpacing: '-1px', color: 'rgba(255,255,255,0.5)' }}>The Void is Open.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', fontWeight: '300', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 48px' }}>
            Radical openness. Zero identity.<br />
            The pulse of your campus, completely unfiltered.
          </p>

          <button className="cta-btn-lg" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight size={20} />
          </button>

          <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.3, letterSpacing: '1px' }}>
            No phone numbers · No real names · 100% anonymous
          </p>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', opacity: 0.3, cursor: 'pointer' }}
            onClick={() => scrollTo(featuresRef)}
          >
            <ChevronDown size={28} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{ color: '#e91e63', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '3px', marginBottom: '16px' }}>WHAT YOU GET</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '700', letterSpacing: '-1px' }}>
            Everything anonymous.<br />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '300' }}>Nothing compromised.</span>
          </h2>
        </motion.div>

        <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', fontSize: '0.95rem' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={howRef} style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <p style={{ color: '#e91e63', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '3px', marginBottom: '16px' }}>THE PROCESS</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '700', letterSpacing: '-1px' }}>
              Four steps to the void.
            </h2>
          </motion.div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="step-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: '700', color: '#e91e63', opacity: 0.7, lineHeight: 1, minWidth: '52px' }}>{step.num}</span>
                <div>
                  <h4 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '1rem' }}>{step.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: '60px' }}
          >
            <button className="cta-btn-lg" onClick={() => navigate('/auth')}>
              Enter the Void <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: '700' }}>
            OYEEE<span style={{ color: '#e91e63' }}>.</span>
          </div>
          <div className="footer-links" style={{ display: 'flex', gap: '32px' }}>
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <span key={link} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
              >{link}</span>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>© 2026 OYEEE. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default Landing;
