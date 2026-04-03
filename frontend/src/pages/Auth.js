import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { safeFetch } from '../config';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('SIGNUP'); // SIGNUP or LOGIN
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP Flow
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  const navigate = useNavigate();
  const { loginUser } = useUser();

  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) otpRefs.current[index + 1].current.focus();
  };

  const validateSignup = () => {
    if (!email.toLowerCase().endsWith('@cgu-odisha.ac.in')) {
      setError('Please use your university email (@cgu-odisha.ac.in)');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleGetOtp = async () => {
    if (!validateSignup()) return;
    setIsLoading(true);
    setError('');
    try {
      await safeFetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: email.split('@')[0] })
      });
      setShowOtp(true);
      setTimer(30);
    } catch(err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const data = await safeFetch('/api/auth/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join('') })
      });
      loginUser({ token: data.token, user: data.user });
      navigate('/rooms');
    } catch(err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill all fields');
    setIsLoading(true);
    setError('');
    try {
      const data = await safeFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      loginUser({ token: data.token, user: data.user });
      navigate('/rooms');
    } catch(err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton = ({ type, active, label, sublabel, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        flex: 1, textAlign: 'center', cursor: 'pointer', padding: '16px 8px',
        background: active ? '#FF0055' : 'rgba(255,255,255,0.02)',
        borderRadius: '12px', transition: 'all 0.3s',
        boxShadow: active ? '0 0 20px rgba(255, 0, 85, 0.4)' : 'none',
        zIndex: active ? 2 : 1
      }}
    >
      <div style={{ fontWeight: '800', fontSize: '1rem', color: active ? '#fff' : 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', marginTop: '4px' }}>{sublabel}</div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', color: '#fff', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* TAB SELECTOR */}
        <div style={{ 
          display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', 
          padding: '8px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <TabButton 
            active={activeTab === 'SIGNUP'} 
            label="SIGN UP" 
            sublabel="For first-time users"
            onClick={() => { setActiveTab('SIGNUP'); setShowOtp(false); setError(''); }}
          />
          <TabButton 
            active={activeTab === 'LOGIN'} 
            label="LOGIN" 
            sublabel="For existing users"
            onClick={() => { setActiveTab('LOGIN'); setShowOtp(false); setError(''); }}
          />
        </div>

        {/* AUTH CARD */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px', padding: '40px', position: 'relative'
        }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ 
                  background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.2)', color: '#FF0055',
                  padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!showOtp ? (
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, x: activeTab === 'SIGNUP' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* EMAIL FIELD */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', letterSpacing: '1px' }}>UNIVERSITY EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="student@cgu-odisha.ac.in"
                    style={{
                      width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none'
                    }}
                    className="auth-input"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>PASSWORD</label>
                  {activeTab === 'LOGIN' && (
                    <span style={{ fontSize: '0.75rem', color: '#FF0055', fontWeight: '700', cursor: 'pointer' }}>Forgot Password?</span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input 
                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={activeTab === 'SIGNUP' ? "Min 6 chars, 1 special, 1 number" : "Your password"}
                    style={{
                      width: '100%', padding: '16px 48px 16px 48px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none'
                    }}
                    className="auth-input"
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                onClick={activeTab === 'SIGNUP' ? handleGetOtp : handleLogin}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '18px', 
                  background: activeTab === 'LOGIN' ? '#FF0055' : 'rgba(255, 0, 85, 0.1)', 
                  color: activeTab === 'LOGIN' ? '#fff' : '#FF0055',
                  border: activeTab === 'LOGIN' ? 'none' : '1px solid rgba(255, 0, 85, 0.2)', 
                  borderRadius: '14px', fontWeight: '800', fontSize: '1.1rem',
                  letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  boxShadow: activeTab === 'LOGIN' ? '0 0 30px rgba(255, 0, 85, 0.3)' : 'none', transition: 'all 0.3s'
                }}
                className="hover-lift"
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : (activeTab === 'SIGNUP' ? 'Get OTP' : 'ENTER THE VOID')}
                <ArrowRight size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: '800' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button style={socialButtonStyle} className="hover-lift">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4285F4' }} />
                  Continue with Google
                </button>
                <button style={socialButtonStyle} className="hover-lift">
                  <Apple size={18} fill="currentColor" />
                  Continue with Apple
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Check your email</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>We sent an OTP to {email}</p>
              </div>

              {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ 
                        position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.9)', 
                        zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', 
                        justifyContent: 'center', borderRadius: '24px', backdropFilter: 'blur(10px)'
                    }}
                  >
                        <Loader2 size={40} className="spin" style={{ color: '#FF0055', marginBottom: '24px' }} />
                        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px' }}>Cooking your identity...</h2>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '8px', fontFamily: 'var(--font-mono)' }}>GENERATING AURA PROFILE_</p>
                  </motion.div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
                {otp.map((digit, index) => (
                  <input key={index} ref={otpRefs.current[index]} type="text" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    style={{
                      width: '48px', height: '60px', textAlign: 'center', fontSize: '1.5rem',
                      fontWeight: '700', background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${digit ? '#FF0055' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '12px', color: '#fff', outline: 'none'
                    }}
                  />
                ))}
              </div>
              <button 
                onClick={handleVerifyOtp} disabled={isLoading}
                style={{
                  width: '100%', padding: '18px', background: '#fff', color: '#000',
                  border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer'
                }}
              >
                VALIDATE
              </button>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                    {timer > 0 ? `Resend code in ${timer}s` : <span onClick={handleGetOtp} style={{ color: '#FF0055', cursor: 'pointer' }}>Resend Code</span>}
                 </p>
              </div>
            </motion.div>
          )}

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              No phone numbers · No real names · No links<br />
              <strong style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>OYEEE is zero-identity by design.</strong>
            </p>
          </div>

        </div>

        {/* PAGE INDICATOR DOT */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF0055', boxShadow: '0 0 10px #FF0055' }} />
        </div>

      </div>

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

const socialButtonStyle = {
  width: '100%', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px', color: '#fff', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s'
};

export default Auth;
