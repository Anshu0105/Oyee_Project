import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { safeFetch } from '../config';
import { Lock, Mail, Key, Shield, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const hasMinLength = password.length >= 6;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  const validateSignup = () => {
    setError('');
    if (!email.toLowerCase().endsWith('@cgu-odisha.ac.in')) {
      setError('Please use your university email (@cgu-odisha.ac.in)');
      return false;
    }
    if (!hasMinLength || !hasSpecialChar || !hasNumber) {
      setError('Password does not meet minimum requirements');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateSignup()) return;
    setIsLoading(true);
    try {
      await safeFetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: email.split('@')[0] })
      });
      setShowOtp(true);
      setTimer(30);
      setError('');
    } catch(err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) return setError('Invalid OTP');
    setIsLoading(true);
    try {
      const data = await safeFetch('/api/auth/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp })
      });
      loginUser({ token: data.token, user: data.user });
      navigate('/rooms');
    } catch(err) {
      setError(err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0].current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) return setError('Please fill all fields');
    setIsLoading(true);
    try {
      const data = await safeFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      loginUser({ token: data.token, user: data.user });
      navigate('/rooms');
    } catch(err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000000', color: '#ffffff', padding: '24px', fontFamily: 'var(--font-main)'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px', background: '#FF0055',
        filter: 'blur(150px)', opacity: 0.08, pointerEvents: 'none'
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: '440px', background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px',
          overflow: 'hidden', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1
        }}
      >
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button 
            onClick={() => { setActiveTab('LOGIN'); setShowOtp(false); setError(''); }}
            style={{
              flex: 1, padding: '24px', background: 'transparent', border: 'none',
              fontWeight: '800', fontSize: '1rem', letterSpacing: '1px',
              color: activeTab === 'LOGIN' ? '#FF0055' : 'rgba(255,255,255,0.3)',
              borderBottom: activeTab === 'LOGIN' ? '2px solid #FF0055' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            LOGIN
          </button>
          <button 
            onClick={() => { setActiveTab('SIGNUP'); setShowOtp(false); setError(''); }}
            style={{
              flex: 1, padding: '24px', background: 'transparent', border: 'none',
              fontWeight: '800', fontSize: '1rem', letterSpacing: '1px',
              color: activeTab === 'SIGNUP' ? '#FF0055' : 'rgba(255,255,255,0.3)',
              borderBottom: activeTab === 'SIGNUP' ? '2px solid #FF0055' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            SIGN UP
          </button>
        </div>

        <div style={{ padding: '40px' }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ 
                  background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.2)', color: '#FF0055',
                  padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!showOtp ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', letterSpacing: '1px' }}>UNIVERSITY EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@cgu-odisha.ac.in"
                    style={{
                      width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s'
                    }}
                    className="auth-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: activeTab === 'SIGNUP' ? '12px' : '32px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', letterSpacing: '1px' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none'
                    }}
                    className="auth-input"
                  />
                </div>
              </div>

              {activeTab === 'SIGNUP' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '32px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ color: hasMinLength ? '#48bb78' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: hasMinLength ? '#48bb78' : 'currentColor' }} />
                    Minimum 6 characters
                  </div>
                  <div style={{ color: hasSpecialChar ? '#48bb78' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: hasSpecialChar ? '#48bb78' : 'currentColor' }} />
                    One special character
                  </div>
                  <div style={{ color: hasNumber ? '#48bb78' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: hasNumber ? '#48bb78' : 'currentColor' }} />
                    One numerical digit
                  </div>
                </div>
              )}

              <button 
                onClick={activeTab === 'SIGNUP' ? handleSendOtp : handleLogin}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '18px', background: '#FF0055', color: '#fff',
                  border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1.1rem',
                  letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  boxShadow: '0 0 30px rgba(255, 0, 85, 0.2)', transition: 'all 0.3s'
                }}
                className="hover-lift"
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : <Shield size={20} />}
                {activeTab === 'SIGNUP' ? 'SECURE ACCESS' : 'ENTER THE VOID'}
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(255, 0, 85, 0.1)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FF0055', marginBottom: '20px' }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ fontWeight: '800', fontSize: '1.75rem', letterSpacing: '-0.5px', marginBottom: '8px' }}>Security Check</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>Sent code to your university email.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs.current[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    style={{
                      width: '48px', height: '60px', textAlign: 'center', fontSize: '1.5rem',
                      fontWeight: '700', background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${digit ? '#FF0055' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '12px', color: '#fff', outline: 'none', transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>

              <button 
                onClick={handleVerifyOtp}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '18px', background: '#ffffff', color: '#000',
                  border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1.1rem',
                  letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  marginBottom: '20px'
                }}
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : <Sparkles size={20} />}
                VALIDATE
              </button>

              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => timer === 0 && handleSendOtp()}
                  disabled={timer > 0 || isLoading}
                  style={{
                    background: 'transparent', border: 'none', fontWeight: '700', fontSize: '0.8rem',
                    color: timer === 0 ? '#FF0055' : 'rgba(255,255,255,0.2)',
                    cursor: timer === 0 ? 'pointer' : 'not-allowed', letterSpacing: '1px'
                  }}
                >
                  {timer > 0 ? `RESEND IN ${timer}S` : 'RESEND CODE'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <style>{`
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .auth-input:focus {
          border-color: #FF0055 !important;
          background: rgba(255,0,85,0.02) !important;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default Auth;
