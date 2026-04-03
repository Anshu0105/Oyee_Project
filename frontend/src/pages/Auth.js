import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BACKEND_URL, safeFetch } from '../config';
import { Lock, Mail, Key, Shield, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('LOGIN'); // LOGIN or SIGNUP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP States
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { loginUser } = useUser();

  // Password Validations
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

    // Auto-focus next
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
    if (!email.endsWith('@cgu-odisha.ac.in')) {
      setError('❌ Please use your university email (@cgu-odisha.ac.in)');
      return false;
    }
    if (!hasMinLength || !hasSpecialChar || !hasNumber) {
      setError('❌ Password does not meet minimum requirements');
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
      // Signup success
      loginUser({ token: data.token, user: data.user });
      navigate('/rooms');
    } catch(err) {
      setError(err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']); // reset on fail
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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      padding: '24px',
      fontFamily: 'var(--font-inter)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative'
      }}>
        {/* Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => { setActiveTab('SIGNUP'); setShowOtp(false); setError(''); }}
            style={{
              flex: 1, padding: '20px', background: 'transparent', border: 'none',
              fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '2px',
              color: activeTab === 'SIGNUP' ? 'var(--accent-primary)' : 'var(--text-dim)',
              borderBottom: activeTab === 'SIGNUP' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            SIGN UP <br/><span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>(FOR FIRST-TIME)</span>
          </button>
          <button 
            onClick={() => { setActiveTab('LOGIN'); setShowOtp(false); setError(''); }}
            style={{
              flex: 1, padding: '20px', background: 'transparent', border: 'none',
              fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '2px',
              color: activeTab === 'LOGIN' ? 'var(--accent-primary)' : 'var(--text-dim)',
              borderBottom: activeTab === 'LOGIN' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            LOGIN <br/><span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>(FOR EXISTING)</span>
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ 
                   background: 'rgba(233, 30, 99, 0.1)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)',
                   padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!showOtp ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>UNIVERSITY EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@cgu-odisha.ac.in"
                    style={{
                      width: '100%', padding: '16px 16px 16px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                      borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border 0.3s'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '16px 16px 16px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                      borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Real-time password indicators ONLY on SIGNUP */}
              {activeTab === 'SIGNUP' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '12px' }}>
                  <div style={{ color: hasMinLength ? 'var(--accent-green)' : 'var(--text-dim)' }}>{hasMinLength ? '✓' : '○'} Min 6 characters</div>
                  <div style={{ color: hasSpecialChar ? 'var(--accent-green)' : 'var(--text-dim)' }}>{hasSpecialChar ? '✓' : '○'} 1 special char (!@#$...)</div>
                  <div style={{ color: hasNumber ? 'var(--accent-green)' : 'var(--text-dim)' }}>{hasNumber ? '✓' : '○'} 1 number</div>
                </div>
              )}
              {activeTab === 'LOGIN' && <div style={{ marginBottom: '24px' }}></div>}

              <button 
                onClick={activeTab === 'SIGNUP' ? handleSendOtp : handleLogin}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '16px', background: 'var(--accent-primary)', color: '#fff',
                  border: 'none', borderRadius: '8px', fontFamily: 'var(--font-bebas)', fontSize: '1.2rem',
                  letterSpacing: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : <Shield size={20} />}
                {activeTab === 'SIGNUP' ? 'SECURE IDENTITY' : 'ENTER VOID'}
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Lock size={32} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', letterSpacing: '1px' }}>VERIFY OTP</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Sent to {email}</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '24px' }}>
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
                      width: '45px', height: '55px', textAlign: 'center', fontSize: '1.5rem',
                      fontFamily: 'var(--font-bebas)', background: 'rgba(0,0,0,0.2)',
                      border: `1px solid ${digit ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                      borderRadius: '8px', color: '#fff', outline: 'none'
                    }}
                  />
                ))}
              </div>

              <button 
                onClick={handleVerifyOtp}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '16px', background: 'var(--accent-green)', color: '#000',
                  border: 'none', borderRadius: '8px', fontFamily: 'var(--font-bebas)', fontSize: '1.2rem',
                  letterSpacing: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: isLoading ? 0.7 : 1, marginBottom: '16px'
                }}
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : <ArrowRight size={20} />}
                VALIDATE
              </button>

              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => timer === 0 && handleSendOtp()}
                  disabled={timer > 0 || isLoading}
                  style={{
                    background: 'transparent', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                    color: timer === 0 ? 'var(--accent-primary)' : 'var(--text-dim)',
                    cursor: timer === 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  {timer > 0 ? `Resend available in ${timer}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Auth;
