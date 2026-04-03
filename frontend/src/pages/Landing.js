import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Shield, MapPin, Gift, ArrowRight, Zap } from 'lucide-react';

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
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3
        };
        this.radius = Math.random() * 1.5;
        this.alpha = Math.random() * 0.3 + 0.1;
        this.color = Math.random() > 0.8 ? '#FF0055' : '#ffffff';
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color === '#FF0055' ? `rgba(255, 0, 85, ${this.alpha})` : `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }

      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        if (this.x < 0 || this.x > canvas.width) this.velocity.x *= -1;
        if (this.y < 0 || this.y > canvas.height) this.velocity.y *= -1;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 80; i++) particles.push(new Particle());
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

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

const SlideUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const processRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div style={{ background: '#000000', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <Particles />
      
      {/* Progress Bar */}
      <motion.div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: '3px', 
        background: '#FF0055', transformOrigin: '0%', zIndex: 1000, scaleX 
      }} />

      {/* Centered Landing Header */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, 
        padding: '24px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Left: Brand */}
        <div 
          onClick={() => scrollTo(heroRef)}
          style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1.5px', color: '#fff', cursor: 'pointer', flex: 1 }}
        >
          OYEEE<span style={{ color: '#FF0055' }}>.</span>
        </div>

        {/* Center: Main Nav */}
        <div style={{ display: 'flex', gap: '48px', fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', flex: 2, justifyContent: 'center' }}>
          <span 
            onClick={() => scrollTo(heroRef)} 
            className="nav-link cursor-pointer hover:text-white transition-all duration-300"
          >Home</span>
          <span 
            onClick={() => scrollTo(featuresRef)} 
            className="nav-link cursor-pointer hover:text-white transition-all duration-300"
          >Features</span>
          <span 
            onClick={() => scrollTo(processRef)} 
            className="nav-link cursor-pointer hover:text-white transition-all duration-300"
          >How It Works</span>
        </div>

        {/* Right: Auth */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <span 
            onClick={() => navigate('/auth')} 
            style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} 
            className="hover:text-white transition-colors"
          >Login</span>
          <button 
            onClick={() => navigate('/auth')}
            style={{ 
              background: '#FF0055', color: '#fff', border: 'none', padding: '12px 24px', 
              borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(255, 0, 85, 0.2)'
            }}
            className="hover:scale-105 active:scale-95 transition-transform"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section ref={heroRef} style={{ 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 24px'
      }}>
        <SlideUp>
          <div style={{ 
            background: 'rgba(255, 0, 85, 0.1)', color: '#FF0055', padding: '8px 16px', 
            borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '32px',
            border: '1px solid rgba(255, 0, 85, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF0055' }} />
            NOW LIVE AT CGU ODISHA
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <h1 style={{ fontSize: 'clamp(5rem, 12vw, 10rem)', fontWeight: '900', letterSpacing: '-5px', lineHeight: 0.9, marginBottom: '24px' }}>
            OYEEE<span style={{ color: '#FF0055' }}>.</span>
          </h1>
        </SlideUp>

        <SlideUp delay={0.2}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '-2px', marginBottom: '32px' }}>
            The Void is Open.
          </h2>
        </SlideUp>

        <SlideUp delay={0.3}>
          <p style={{ maxWidth: '650px', fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '48px' }}>
            Radical openness. Zero identity.<br />The pulse of your campus, completely unfiltered.
          </p>
        </SlideUp>

        <SlideUp delay={0.4}>
          <button 
            onClick={() => navigate('/auth')}
            style={{ 
              background: '#FF0055', color: '#fff', border: 'none', padding: '22px 56px', 
              borderRadius: '18px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 0 50px rgba(255, 0, 85, 0.4)'
            }}
            className="hover:scale-105 active:scale-95 transition-transform"
          >
            Get Started <ArrowRight size={20} />
          </button>
        </SlideUp>

        <div style={{ position: 'absolute', bottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontWeight: '500', letterSpacing: '0.5px' }}>
            No phone numbers · No real names · 100% anonymous
          </p>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }} onClick={() => scrollTo(featuresRef)}>
            <ArrowRight size={28} style={{ transform: 'rotate(90deg)' }} />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: FEATURES */}
      <section ref={featuresRef} style={{ padding: '160px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <SlideUp>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <p style={{ color: '#FF0055', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '4px', marginBottom: '16px' }}>WHAT YOU GET</p>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '800', letterSpacing: '-2px', lineHeight: 1.1 }}>Everything anonymous.<br />Nothing compromised.</h2>
          </div>
        </SlideUp>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          <FeatureItem icon={Shield} title="Anonymous Chat Rooms" desc="Connect with your campus completely anonymously. No real names, no traces." delay={0.1} />
          <FeatureItem icon={Zap} title="Aura System" desc="Earn points with every interaction. Unlock rewards, climb the leaderboard." delay={0.2} />
          <FeatureItem icon={MapPin} title="Location-Based Rooms" desc="Find people physically nearby using GPS clustering — like magic." delay={0.3} />
          <FeatureItem icon={Gift} title="Exclusive Merch" desc="Spend your Aura on real OYEEE merchandise. The void rewards the active." delay={0.4} />
        </div>
      </section>

      {/* SECTION 3: THE PROCESS */}
      <section ref={processRef} style={{ padding: '160px 24px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <SlideUp>
          <div style={{ marginBottom: '80px' }}>
            <p style={{ color: '#FF0055', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '4px', marginBottom: '16px' }}>THE PROCESS</p>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '800', letterSpacing: '-2px', lineHeight: 1.1 }}>Four steps to the void.</h2>
          </div>
        </SlideUp>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px', marginBottom: '80px' }}>
          <StepItem number="01" title="Sign up with university email" desc="Only @cgu-odisha.ac.in members can enter." delay={0.1} />
          <StepItem number="02" title="Get your anonymous aura name" desc="We generate a unique identity for you. No real names." delay={0.2} />
          <StepItem number="03" title="Join rooms and start chatting" desc="WiFi rooms, GPS rooms, direct messages — all anonymous." delay={0.3} />
          <StepItem number="04" title="Earn aura points, claim rewards" desc="Every interaction earns you Aura. Spend it in the store." delay={0.4} />
        </div>

        <SlideUp delay={0.5}>
          <button 
            onClick={() => navigate('/auth')}
            style={{ 
              background: '#FF0055', color: '#fff', border: 'none', padding: '22px 56px', 
              borderRadius: '18px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 0 50px rgba(255, 0, 85, 0.4)'
            }}
            className="hover:scale-105 active:scale-95 transition-transform"
          >
            Enter the Void <ArrowRight size={20} />
          </button>
        </SlideUp>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '100px 64px 60px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '80px', flexWrap: 'wrap', gap: '40px' }}>
          <div 
            onClick={() => scrollTo(heroRef)}
            style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1.5px', cursor: 'pointer' }}
          >
            OYEEE<span style={{ color: '#FF0055' }}>.</span>
          </div>
          <div style={{ display: 'flex', gap: '48px', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
            <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-white transition-colors">Contact</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem', fontWeight: '500' }}>
            © 2026 OYEEE. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        html { scroll-behavior: smooth; }
        .cursor-pointer { cursor: pointer; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #FF005533; }
      `}</style>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc, delay }) => (
  <SlideUp delay={delay}>
    <motion.div 
      whileHover={{ y: -5, background: 'rgba(255, 255, 255, 0.03)' }}
      style={{
        padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%'
      }}
    >
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 0, 85, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF0055' }}>
        <Icon size={24} />
      </div>
      <h3 style={{ fontWeight: '700', fontSize: '1.6rem', color: '#fff' }}>{title}</h3>
      <p style={{ fontWeight: '400', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{desc}</p>
    </motion.div>
  </SlideUp>
);

const StepItem = ({ number, title, desc, delay }) => (
  <SlideUp delay={delay}>
    <div style={{
      padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px', display: 'flex', gap: '24px', alignItems: 'flex-start', height: '100%'
    }}>
      <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FF0055', minWidth: '60px', fontFamily: 'serif' }}>{number}</span>
      <div style={{ textAlign: 'left' }}>
        <h4 style={{ fontWeight: '700', fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>{title}</h4>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{desc}</p>
      </div>
    </div>
  </SlideUp>
);

export default Landing;
