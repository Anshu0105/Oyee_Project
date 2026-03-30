import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, Wifi, GraduationCap, MapPin, Zap, MessageSquare, Image, Store, Megaphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useUser();
  const [stars, setStars] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Generate star fall stars
    const newStars = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: Math.random() * 100 + '%',
      delay: Math.random() * 5 + 's',
      duration: Math.random() * 4 + 3 + 's',
    }));
    setStars(newStars);
  }, []);

  const validateEmail = (val) => {
    setEmail(val);
    if (!val) {
      setError('');
      return;
    }
    if (!val.endsWith('@cgu-odisha.ac.in')) {
      setError('Please use your university email (@cgu-odisha.ac.in) or contact the authors');
    } else {
      setError('');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@cgu-odisha.ac.in')) {
      setError('Please use your university email (@cgu-odisha.ac.in) or contact the authors');
      return;
    }
    
    setIsLoading(true);
    
    // Execute real backend dynamic registration/login!
    const success = await loginUser(email);
    
    if (success) {
      setIsLoading(false);
      navigate('/rooms');
    } else {
      setIsLoading(false);
      setError('Network synchronization failed. Is backend running on port 5002?');
    }
  };

  const features = [
    { icon: Shield, label: 'ANONYMOUS' },
    { icon: Wifi, label: 'WIFI ROOMS' },
    { icon: Mail, label: 'UNI MAIL' },
    { icon: MapPin, label: 'GPS ROOMS' },
    { icon: Zap, label: 'AURA SYSTEM' },
    { icon: MessageSquare, label: 'DM FRIENDS' },
    { icon: Image, label: 'GIF + STICKERS' },
    { icon: Shield, label: 'NO LINKS' },
    { icon: Store, label: 'AURA STORE' },
    { icon: Megaphone, label: 'PROMOTIONS' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-light)',
      position: 'relative',
      overflow: 'hidden',
      color: '#1a1a1a',
      fontFamily: 'var(--font-inter)'
    }}>
      {/* Star Fall Background (Subtle for light theme) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.4 }}>
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              width: star.size + 'px',
              height: star.size + 'px',
              left: star.left,
              background: '#e91e63',
              animationDelay: star.delay,
              animationDuration: star.duration
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', width: '100%', zIndex: 2 }}>
        {/* Left Panel: Branding */}
        <div style={{
          flex: 1,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          borderRight: '1px solid rgba(0,0,0,0.05)',
          position: 'relative'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '120px',
              letterSpacing: '8px',
              color: '#1a1a1a',
              lineHeight: 0.9,
              marginBottom: '20px'
            }}>
              OYEEE<span style={{ color: 'var(--accent-primary)' }}>.</span>
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.2rem',
              color: 'var(--accent-primary)',
              letterSpacing: '2px',
              marginBottom: '40px'
            }}>
              one door. infinite anonymity.
            </p>

            <div style={{ maxWidth: '500px', marginBottom: '60px' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: '300', lineHeight: '1.4', color: '#444' }}>
                Radical openness. Zero identity. <br />
                The pulse of your campus, <br />
                completely unfiltered.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '450px' }}>
              {features.map((feat, idx) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    background: '#fcfcfc',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    color: '#666'
                  }}
                >
                  <feat.icon size={14} style={{ color: 'var(--accent-primary)' }} />
                  {feat.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Panel: Auth */}
        <div style={{
          width: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#f8f9fa'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '4px', marginBottom: '8px' }}>ENTER</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5, marginBottom: '48px' }}>// one door. infinite anonymity.</p>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>
                  UNIVERSITY / PERSONAL MAIL
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    placeholder="2301020857@cgu-odisha.ac.in"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: 'white',
                      border: `1px solid ${error ? 'var(--accent-primary)' : '#ddd'}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s',
                      boxShadow: error ? '0 0 10px rgba(233, 30, 99, 0.1)' : 'none'
                    }}
                  />
                  {email && !error && (
                    <CheckCircle2 size={18} style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--accent-green)' }} />
                  )}
                  {error && (
                    <AlertCircle size={18} style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--accent-primary)' }} />
                  )}
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginTop: '8px', fontWeight: '500' }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                className="interactive"
                disabled={isLoading || !email || error}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '1.4rem',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  opacity: (isLoading || !email || error) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                  />
                ) : 'JOIN THE VOID'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
                <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
              </div>

              <button
                type="button"
                className="interactive"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'white',
                  color: '#444',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.3s'
                }}
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" style={{ width: '20px' }} />
                CONTINUE WITH GOOGLE
              </button>
            </form>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px', letterSpacing: '1px' }}>
                No phone numbers • No real names • No links
              </p>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                OYEEE is zero-identity by design.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .interactive:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .interactive:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default Login;
