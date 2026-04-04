import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BACKEND_URL, safeFetch } from '../config';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('SIGNUP'); // SIGNUP, LOGIN
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

  // Password Validations
  const hasMinLength = password.length >= 6;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const allRequirementsMet = hasMinLength && hasSpecialChar && hasNumber;

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

  const handleGetOtp = async () => {
    if (!allRequirementsMet && activeTab === 'SIGNUP') {
        setError('Please manifest all password requirements.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      await safeFetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)', color: '#fff', padding: '20px'
    }}>
      
      {/* Branded Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3.5rem', letterSpacing: '4px', marginBottom: '8px' }}>
          OYEEE<span style={{ color: 'var(--accent-primary)' }}>.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>
          one door. infinite anonymity.
        </p>
      </motion.div>

      <div style={{
        width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.02)', 
        borderRadius: '24px', border: '1px solid var(--border-main)', padding: '8px'
      }}>
        
        {/* Tab Manifest */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          {['SIGNUP', 'LOGIN'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowOtp(false); setError(''); }}
              style={{
                padding: '16px 12px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                background: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeTab === tab ? '0 8px 24px rgba(233, 30, 99, 0.3)' : 'none'
              }}
            >
              <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '2px' }}>{tab.replace('UP', ' UP')}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                {tab === 'SIGNUP' ? 'For first-time users' : 'For existing users'}
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {!showOtp ? (
              <motion.div key="fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Email Field */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '800', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>
                    UNIVERSITY EMAIL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.1)' }} />
                    <input 
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="2301020876@cgu-odisha.ac.in"
                      style={{
                        width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)',
                        borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    {email.includes('@cgu-odisha.ac.in') && (
                        <CheckCircle2 size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-green)' }} />
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontWeight: '800', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>
                    PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.1)' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••"
                      style={{
                        width: '100%', padding: '14px 44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)',
                        borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Validator Checklist (Signup only) */}
                {activeTab === 'SIGNUP' && (
                  <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'At least 6 characters', valid: hasMinLength },
                      { label: 'At least 1 special character (!@#$%^&*)', valid: hasSpecialChar },
                      { label: 'At least 1 number (0-9)', valid: hasNumber }
                    ].map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: req.valid ? 'var(--accent-green)' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>
                        <CheckCircle2 size={14} style={{ opacity: req.valid ? 1 : 0.3 }} />
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'rgba(233, 30, 99, 0.1)', border: '1px solid rgba(233, 30, 99, 0.2)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <AlertCircle size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{error}</span>
                  </motion.div>
                )}

                <button 
                  onClick={activeTab === 'SIGNUP' ? handleGetOtp : handleLogin}
                  disabled={isLoading}
                  style={{
                    width: '100%', padding: '16px', background: 'rgba(233, 30, 99, 0.1)', color: 'var(--accent-primary)',
                    border: '1px solid rgba(233, 30, 99, 0.2)', borderRadius: '14px', fontWeight: '800', fontSize: '0.9rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  className="interactive hover-lift"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      {activeTab === 'SIGNUP' ? 'Get OTP →' : 'MANIFEST →'}
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>FREQUENCY CHECK</h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Entering the code sent to {email}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '24px' }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx} ref={otpRefs.current[idx]} type="text" maxLength="1" value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      style={{
                        width: '100%', height: '54px', textAlign: 'center', background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-main)', borderRadius: '12px', fontSize: '1.2rem', fontWeight: '800', color: '#fff', outline: 'none'
                      }}
                    />
                  ))}
                </div>

                <button 
                  onClick={handleVerifyOtp} disabled={isLoading}
                  style={{
                    width: '100%', padding: '16px', background: 'var(--accent-primary)', color: '#fff',
                    borderRadius: '14px', border: 'none', fontWeight: '800', cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(233, 30, 99, 0.2)'
                  }}
                >
                  {isLoading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
                </button>
                
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                  {timer > 0 ? `Resend available in ${timer}s` : (
                    <span onClick={handleGetOtp} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '700' }}>Resend Signal</span>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '15px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: '700' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
          </div>

          <button 
            onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
            style={{
              width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', 
              color: '#fff', border: '1px solid var(--border-main)', borderRadius: '14px', 
              fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}
            className="interactive hover-lift"
          >
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></div>
            </div>
            Continue with Google
          </button>
        </div>
      </div>

      <p style={{ marginTop: '32px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', maxWidth: '280px', textAlign: 'center', lineHeight: 1.6 }}>
        By merging into the Void, you acknowledge that all signals are moderated.
      </p>
    </div>
  );
};

// Simple loader helper
const Loader2 = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);


export default Auth;
