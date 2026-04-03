import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, Wifi, GraduationCap, MapPin, Zap, MessageSquare, Image, Store, Megaphone, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { initiateLogin, verifyOTP } = useUser();
  const [stars, setStars] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Step Management: 'email' or 'otp'
  const [step, setStep] = useState('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputs = useRef([]);

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

  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const validateEmail = (val) => {
    setEmail(val);
    if (!val) {
      setError('');
      return;
    }
    if (!val.endsWith('@cgu-odisha.ac.in')) {
      setError('Please use your university email (@cgu-odisha.ac.in)');
    } else {
      setError('');
    }
  };

  const handleInitiateLogin = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@cgu-odisha.ac.in')) {
      setError('Please use your university email (@cgu-odisha.ac.in)');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await initiateLogin(email);
      if (result.directLogin) {
        navigate('/rooms');
      } else {
        setStep('otp');
        setTimer(30);
        setCanResend(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyOTP(email, otpString);
      navigate('/rooms');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await initiateLogin(email);
      setTimer(30);
      setCanResend(false);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setIsLoading(false);
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
      {/* Star Fall Background */}
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
          position: 'relative',
          display: window.innerWidth < 1024 ? 'none' : 'flex'
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
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          background: '#f8f9fa'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '4px', marginBottom: '8px' }}>ENTER</h2>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5, marginBottom: '48px' }}>// one door. infinite anonymity.</p>

                  <form onSubmit={handleInitiateLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>
                        UNIVERSITY EMAIL (@cgu-odisha.ac.in)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => validateEmail(e.target.value)}
                          placeholder="2301020857@cgu-odisha.ac.in"
                          disabled={isLoading}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            background: 'white',
                            border: `1px solid ${error ? 'var(--accent-primary)' : '#ddd'}`,
                            borderRadius: '8px',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s'
                          }}
                        />
                        {email && !error && (
                          <CheckCircle2 size={18} style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--accent-green)' }} />
                        )}
                        {error && (
                          <AlertCircle size={18} style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--accent-primary)' }} />
                        )}
                      </div>
                      {error && (
                        <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginTop: '8px', fontWeight: '500' }}>
                          {error}
                        </p>
                      )}
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
                        opacity: (isLoading || !email || error) ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}
                    >
                      {isLoading ? <Loader2 className="spin" /> : 'GET OTP'}
                    </button>
                    
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, textAlign: 'center' }}>
                      By entering, you remain 100% anonymous.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button 
                    onClick={() => setStep('email')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600' }}
                  >
                    <ArrowLeft size={16} /> Edit Email
                  </button>
                  
                  <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '4px', marginBottom: '8px' }}>VERIFY</h2>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5, marginBottom: '8px' }}>// checking your pulse</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '32px' }}>Code sent to: <strong>{email}</strong></p>

                  <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          style={{
                            width: '50px',
                            height: '60px',
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            background: 'white',
                            outline: 'none',
                            transition: 'all 0.3s',
                            borderColor: digit ? 'var(--accent-primary)' : '#ddd',
                            boxShadow: digit ? '0 0 10px rgba(233, 30, 99, 0.1)' : 'none'
                          }}
                        />
                      ))}
                    </div>

                    {error && (
                      <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', textAlign: 'center', fontWeight: '500' }}>
                        {error}
                      </p>
                    )}

                    <div>
                      <button
                        type="submit"
                        className="interactive"
                        disabled={isLoading || otp.join('').length !== 6}
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
                          opacity: (isLoading || otp.join('').length !== 6) ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px'
                        }}
                      >
                        {isLoading ? <Loader2 className="spin" /> : 'VERIFY & ENTER'}
                      </button>

                      <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        {canResend ? (
                          <button 
                            type="button"
                            onClick={handleResend}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                          >
                            Resend OTP
                          </button>
                        ) : (
                          <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>
                            Resend in {timer}s
                          </p>
                        )}
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.4, marginBottom: '8px', letterSpacing: '1px' }}>
                No phone numbers • No real names • No links
              </p>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-primary)', opacity: 0.8 }}>
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
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .star {
          position: absolute;
          border-radius: 50%;
          animation: fall linear infinite;
        }
        @keyframes fall {
          from { transform: translateY(-100vh); }
          to { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default Login;
