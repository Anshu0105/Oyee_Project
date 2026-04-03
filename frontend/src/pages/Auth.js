import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { safeFetch } from '../config';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('SIGNUP'); // SIGNUP, LOGIN, FORGOT, RESET
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    if (isNaN(value)) {
      if (value === '') {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        if (index > 0) otpRefs.current[index - 1].current.focus();
      }
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) otpRefs.current[index + 1].current.focus();
  };

  const validateSignup = () => {
    const cguRegex = /^(22|23|24|25)\d{4}(0\d{3}|1\d{3}|2000)@cgu-odisha\.ac\.in$/;
    if (!cguRegex.test(email.toLowerCase())) {
      setError('CGU Access Only: Use a valid Student Email (e.g., 2301020816@cgu-odisha.ac.in) from batches 2022-2025.');
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

  const handleRequestReset = async () => {
    if (!email) return setError('Please enter your university email');
    setIsLoading(true);
    setError('');
    try {
      await safeFetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setActiveTab('RESET');
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (otp.join('').length < 6) return setError('Please enter the 6-digit code');
    setIsLoading(true);
    setError('');
    try {
      await safeFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword })
      });
      setSuccess('Identity Restored! Please login with your new password.');
      setActiveTab('LOGIN');
      setShowOtp(false);
    } catch (err) {
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
        background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
        borderRadius: '12px', transition: 'all 0.3s',
        boxShadow: active ? '0 0 20px var(--glass-border)' : 'none',
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
      background: 'var(--bg-main)', color: 'var(--text-main)', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
        
        {/* TAB SELECTOR */}
        <AnimatePresence>
        {(activeTab === 'SIGNUP' || activeTab === 'LOGIN') && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ 
              display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', 
              padding: '6px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-main)' 
            }}
          >
            <TabButton 
              active={activeTab === 'SIGNUP'} 
              label="SIGN UP" 
              sublabel="New peer"
              onClick={() => { setActiveTab('SIGNUP'); setShowOtp(false); setError(''); setSuccess(''); }}
            />
            <TabButton 
              active={activeTab === 'LOGIN'} 
              label="LOGIN" 
              sublabel="Return peer"
              onClick={() => { setActiveTab('LOGIN'); setShowOtp(false); setError(''); setSuccess(''); }}
            />
          </motion.div>
        )}
        </AnimatePresence>

        {/* AUTH CARD */}
        <div className="glass" style={{
          background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
          borderRadius: '24px', padding: '32px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ 
                  background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.2)', color: '#FF0055',
                  padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ 
                  background: 'rgba(0, 255, 128, 0.1)', border: '1px solid rgba(0, 255, 128, 0.2)', color: '#00ff80',
                  padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <AlertCircle size={18} /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          {!showOtp && (activeTab === 'SIGNUP' || activeTab === 'LOGIN') && (
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, x: activeTab === 'SIGNUP' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>INSTITUTIONAL EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="student@cgu-odisha.ac.in"
                    style={{
                      width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)',
                      borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                    }}
                    className="auth-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>ACCESS KEY</label>
                  {activeTab === 'LOGIN' && (
                    <span onClick={() => { setActiveTab('FORGOT'); setError(''); }} style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700', cursor: 'pointer', opacity: 0.8 }}>Forgot Password?</span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input 
                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={activeTab === 'SIGNUP' ? "Min 6 chars" : "Access password"}
                    style={{
                      width: '100%', padding: '14px 44px 14px 44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)',
                      borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                    }}
                    className="auth-input"
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </div>

              <button 
                onClick={activeTab === 'SIGNUP' ? handleGetOtp : handleLogin}
                disabled={isLoading}
                className="interactive hover-lift"
                style={{
                  width: '100%', padding: '16px', 
                  background: activeTab === 'LOGIN' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)', 
                  color: activeTab === 'LOGIN' ? '#fff' : 'var(--accent-primary)',
                  border: activeTab === 'LOGIN' ? 'none' : '1px solid var(--border-main)', 
                  borderRadius: '14px', fontWeight: '800', fontSize: '1rem',
                  letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                {isLoading ? <Loader2 size={18} className="spin" /> : (activeTab === 'SIGNUP' ? 'IDENTIFY ME' : 'ENTER THE VOID')}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </motion.div>
          )}

          {activeTab === 'FORGOT' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
               <h3 style={{ fontWeight: '800', fontSize: '1.4rem', marginBottom: '8px' }}>RECOVER IDENTITY</h3>
               <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Enter your institutional email to receive a recovery code.</p>
               
               <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="student@cgu-odisha.ac.in"
                    style={{
                      width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)',
                      borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                    }}
                    className="auth-input"
                  />
                </div>
              </div>

              <button 
                onClick={handleRequestReset} disabled={isLoading}
                className="interactive hover-lift"
                style={{
                  width: '100%', padding: '16px', background: 'var(--accent-primary)', 
                  color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                {isLoading ? <Loader2 size={18} className="spin" /> : 'SEND RECOVERY CODE'}
              </button>
              <p onClick={() => setActiveTab('LOGIN')} style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', opacity: 0.4, cursor: 'pointer' }}>Wait, I remember it.</p>
            </motion.div>
          )}

          {activeTab === 'RESET' && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.4rem', marginBottom: '8px' }}>NEW FREQUENCY</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Enter the 6-digit code and your new access key.</p>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                  {otp.map((digit, index) => (
                    <input key={index} ref={otpRefs.current[index]} type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      style={{
                        width: '40px', height: '52px', textAlign: 'center', fontSize: '1.2rem',
                        fontWeight: '700', background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${digit ? 'var(--accent-primary)' : 'var(--border-main)'}`,
                        borderRadius: '10px', color: '#fff', outline: 'none'
                      }}
                    />
                  ))}
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>NEW PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                    <input 
                      type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      style={{
                        width: '100%', padding: '14px 44px 14px 44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)',
                        borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                      }}
                      className="auth-input"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleResetPassword} disabled={isLoading}
                  className="interactive hover-lift"
                  style={{
                    width: '100%', padding: '16px', background: 'var(--accent-primary)', 
                    color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer'
                  }}
                >
                  {isLoading ? <Loader2 size={18} className="spin" /> : 'RESTORE IDENTITY'}
                </button>
             </motion.div>
          )}

          {showOtp && (activeTab === 'SIGNUP') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>Verify Identity</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Token transmitted to {email}</p>
              </div>

              {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ 
                        position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.95)', 
                        zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', 
                        justifyContent: 'center', borderRadius: '24px', backdropFilter: 'blur(10px)'
                    }}
                  >
                        <Loader2 size={40} className="spin" style={{ color: 'var(--accent-primary)', marginBottom: '20px' }} />
                        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px' }}>Cooking identity...</h2>
                        <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>CALIBRATING_AURA_</p>
                  </motion.div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                {otp.map((digit, index) => (
                  <input key={index} ref={otpRefs.current[index]} type="text" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    style={{
                      width: '40px', height: '52px', textAlign: 'center', fontSize: '1.2rem',
                      fontWeight: '700', background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${digit ? 'var(--accent-primary)' : 'var(--border-main)'}`,
                      borderRadius: '10px', color: '#fff', outline: 'none'
                    }}
                  />
                ))}
              </div>
              <button 
                onClick={handleVerifyOtp} disabled={isLoading}
                className="interactive hover-lift"
                style={{
                  width: '100%', padding: '16px', background: '#fff', color: '#000',
                  border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer'
                }}
              >
                MANIFEST
              </button>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                 <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    {timer > 0 ? `Resend in ${timer}s` : <span onClick={handleGetOtp} style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>Recover new token</span>}
                 </p>
              </div>
            </motion.div>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
              By merging into the Void, you acknowledge <br /> 
              that all signals are moderated.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .auth-input:focus { border-color: var(--accent-primary) !important; background: rgba(255,255,255,0.04) !important; }
        .hover-lift { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-2px); filter: brightness(1.1); }
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
