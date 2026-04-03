import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, XCircle,
  Mail, Lock, AlertCircle, ArrowRight, Check, Sparkles
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const BACKEND_URL = window.location.hostname === 'localhost' 
  ? (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002')
  : 'https://oyeee-backend.onrender.com';

const validateEmail = (email) => email.endsWith('@cgu-odisha.ac.in');
const validatePassword = (pw) => ({
  minLength: pw.length >= 6,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  hasNumber: /\d/.test(pw),
  get valid() { return this.minLength && this.hasSpecial && this.hasNumber; }
});

// ─── Reusable sub-components ─────────────────────────────────────────────────
const Req = ({ met, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: met ? '#5ec87a' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>
    {met ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {label}
  </div>
);

const OAuthBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s', fontFamily: 'inherit'
  }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
     onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
    <span style={{ fontSize: '1.1rem' }}>{icon}</span>{label}
  </button>
);

const InlineError = ({ msg }) => msg ? (
  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b8a', fontSize: '0.8rem', fontWeight: '500' }}>
    <AlertCircle size={14} /> {msg}
  </motion.div>
) : null;

const SuccessMsg = ({ msg }) => msg ? (
  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5ec87a', fontSize: '0.8rem', fontWeight: '500', background: 'rgba(94,200,122,0.08)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(94,200,122,0.2)' }}>
    <Check size={14} /> {msg}
  </motion.div>
) : null;

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: '500' }}>OR</span>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
  </div>
);

// Shared style tokens
const labelStyle = { display: 'block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '2px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' };
const inputStyle = {
  width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff',
  fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit'
};
const btnPrimary = {
  width: '100%', padding: '16px', background: 'linear-gradient(135deg, #e91e63, #c41651)',
  color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem',
  fontWeight: '700', letterSpacing: '1.5px', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s', fontFamily: 'inherit'
};
const btnSecondary = {
  width: '100%', padding: '14px', background: 'rgba(233,30,99,0.1)',
  color: '#e91e63', border: '1px solid rgba(233,30,99,0.3)', borderRadius: '10px',
  fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', fontFamily: 'inherit'
};

// ─── COOKING LOADING SCREEN ───────────────────────────────────────────────────
const COOKING_TEXTS = [
  '🍳 Mixing ingredients...',
  '🌶️ Spicing things up...',
  '🍽️ Plating your persona...',
  '✨ Almost ready...',
  '🎉 Serving your identity!'
];

const CookingScreen = () => {
  const [textIdx, setTextIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTextIdx(i => (i + 1) % COOKING_TEXTS.length), 700);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid rgba(233,30,99,0.2)', borderTop: '3px solid #e91e63', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.8rem' }}>🍳</span>
      </motion.div>
      <div>
        <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>Generating your anonymous identity...</p>
        <AnimatePresence mode="wait">
          <motion.p key={textIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{ color: '#e91e63', fontSize: '0.9rem', fontWeight: '600' }}>
            {COOKING_TEXTS[textIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── WELCOME SCREEN ───────────────────────────────────────────────────────────
const WelcomeScreen = ({ auraName, avatarEmoji, auraColor, onEnter }) => {
  useEffect(() => {
    const t = setTimeout(onEnter, 4000);
    return () => clearTimeout(t);
  }, [onEnter]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', damping: 20 }}
      style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

      {/* Checkmark */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 12 }}
        style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(94,200,122,0.15)', border: '2px solid #5ec87a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle2 size={32} color="#5ec87a" />
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', letterSpacing: '1px' }}>
        WELCOME TO THE VOID
      </motion.p>

      {/* Avatar */}
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', damping: 14 }}
        style={{ width: '100px', height: '100px', borderRadius: '50%', background: `${auraColor}25`, border: `3px solid ${auraColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', boxShadow: `0 0 40px ${auraColor}40` }}>
        {avatarEmoji}
      </motion.div>

      {/* Name reveal */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '8px', letterSpacing: '2px' }}>YOUR ANONYMOUS IDENTITY</p>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff', marginBottom: '4px' }}>
          {auraName}
        </h2>
        <p style={{ color: auraColor, fontSize: '0.8rem', fontWeight: '600' }}>
          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Uniquely yours. 100% anonymous.
        </p>
      </motion.div>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        onClick={onEnter}
        style={{ ...btnPrimary, marginTop: '8px', maxWidth: '280px' }}>
        ENTER THE VOID <ArrowRight size={18} />
      </motion.button>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
        Auto-entering in a few seconds...
      </motion.p>
    </motion.div>
  );
};

// ─── SIGN UP FORM ─────────────────────────────────────────────────────────────
const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [terms, setTerms] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [phase, setPhase] = useState('form'); // 'form' | 'cooking' | 'welcome'
  const [newUser, setNewUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { login: ctxLogin } = useUser();

  const pwVal = validatePassword(password);
  const emailOk = validateEmail(email);
  const otpStr = otp.join('');

  useEffect(() => {
    if (!otpSent) return;
    let iv = setInterval(() => setTimer(t => {
      if (t <= 1) { clearInterval(iv); setCanResend(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [otpSent]);

  const handleOtpChange = (i, val) => {
    if (isNaN(val)) return;
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!emailOk) return setError('Please use your @cgu-odisha.ac.in university email.');
    if (!pwVal.valid) return setError('Please fix your password before requesting OTP.');
    setError(''); setOtpLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpSent(true); setTimer(30); setCanResend(false);
      setOtpSuccess(`OTP sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Is the backend running?');
    } finally { setOtpLoading(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!terms) return setError('Please accept the Terms of Service to continue.');
    if (otpStr.length !== 6) return setError('Please enter the 6-digit OTP.');
    setError(''); setLoading(true);
    setPhase('cooking'); // Show cooking animation
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp: otpStr })
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase('form');
        throw new Error(data.error);
      }
      ctxLogin(data.token, data.user);
      setNewUser(data.user);
      // Wait a moment for the cooking animation to play
      setTimeout(() => setPhase('welcome'), 2000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  // Cooking & welcome phases
  if (phase === 'cooking') return <CookingScreen />;
  if (phase === 'welcome' && newUser) return (
    <WelcomeScreen
      auraName={newUser.auraName}
      avatarEmoji={newUser.avatarEmoji}
      auraColor={newUser.auraColor}
      onEnter={() => navigate('/rooms')}
    />
  );

  return (
    <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Email */}
      <div>
        <label style={labelStyle}>UNIVERSITY EMAIL</label>
        <div style={{ position: 'relative' }}>
          <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="2301020857@cgu-odisha.ac.in"
            style={{ ...inputStyle, paddingLeft: '44px', borderColor: email && !emailOk ? '#ff6b8a' : email && emailOk ? '#5ec87a' : 'rgba(255,255,255,0.1)' }}
            autoFocus
          />
          {email && (emailOk
            ? <CheckCircle2 size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#5ec87a' }} />
            : <XCircle size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ff6b8a' }} />
          )}
        </div>
        {email && !emailOk && <InlineError msg="Please use your university email (@cgu-odisha.ac.in)" />}
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>PASSWORD</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input type={showPass ? 'text' : 'password'} value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="Min 6 chars, 1 special, 1 number"
            style={{ ...inputStyle, paddingLeft: '44px', paddingRight: '44px' }}
          />
          <button type="button" onClick={() => setShowPass(v => !v)}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            <Req met={pwVal.minLength} label="At least 6 characters" />
            <Req met={pwVal.hasSpecial} label="At least 1 special character (!@#$%^&*)" />
            <Req met={pwVal.hasNumber} label="At least 1 number (0-9)" />
          </div>
        )}
      </div>

      {/* Get OTP / OTP Boxes */}
      {!otpSent ? (
        <>
          <button type="button" onClick={handleSendOTP} disabled={otpLoading || !emailOk || !pwVal.valid}
            style={{ ...btnSecondary, opacity: (!emailOk || !pwVal.valid) ? 0.5 : 1 }}>
            {otpLoading ? <><Loader2 size={16} className="spin" /> Sending OTP...</> : 'Get OTP →'}
          </button>
          <InlineError msg={error} />
        </>
      ) : (
        <>
          <SuccessMsg msg={otpSuccess} />
          <div>
            <label style={labelStyle}>ENTER 6-DIGIT OTP</label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {otp.map((d, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  style={{
                    width: '48px', height: '58px', textAlign: 'center', fontSize: '1.4rem',
                    fontWeight: '700', background: 'rgba(255,255,255,0.05)',
                    border: `2px solid ${d ? '#e91e63' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', color: '#fff', outline: 'none',
                    boxShadow: d ? '0 0 12px rgba(233,30,99,0.2)' : 'none', transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
              {canResend
                ? <button type="button" onClick={handleSendOTP} style={{ background: 'none', border: 'none', color: '#e91e63', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'inherit' }}>Resend OTP</button>
                : `Resend in ${timer}s...`}
            </div>
          </div>

          {/* Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#e91e63', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }} />
            I agree to the <span style={{ color: '#e91e63', textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: '#e91e63', textDecoration: 'underline' }}>Privacy Policy</span>. By entering, you remain 100% anonymous.
          </label>

          <InlineError msg={error} />

          <button type="submit" disabled={loading || otpStr.length !== 6 || !terms}
            style={{ ...btnPrimary, opacity: (loading || otpStr.length !== 6 || !terms) ? 0.5 : 1 }}>
            {loading ? <><Loader2 size={18} className="spin" /> Cooking your identity...</> : <>ENTER THE VOID <ArrowRight size={18} /></>}
          </button>
        </>
      )}

      <Divider />
      <OAuthBtn icon="🔵" label="Continue with Google" onClick={() => alert('OAuth coming soon — register Google credentials first.')} />
      <OAuthBtn icon="🍎" label="Continue with Apple" onClick={() => alert('OAuth coming soon — register Apple credentials first.')} />
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6' }}>
        No phone numbers · No real names · No links<br />
        <strong style={{ color: 'rgba(255,255,255,0.5)' }}>OYEEE is zero-identity by design.</strong>
      </p>
    </form>
  );
};

// ─── LOGIN FORM ───────────────────────────────────────────────────────────────
const LoginForm = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Forgot password flow: 'none' | 'sent' | 'reset_done'
  const [forgotPhase, setForgotPhase] = useState('none');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotTimer, setForgotTimer] = useState(30);
  const [canResendForgot, setCanResendForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [devOtp, setDevOtp] = useState(''); // shows OTP when mail fails
  const forgotOtpRefs = useRef([]);
  const navigate = useNavigate();
  const { login: ctxLogin } = useUser();

  const emailOk = validateEmail(email);
  const forgotOtpStr = forgotOtp.join('');
  const pwVal = validatePassword(newPassword);

  useEffect(() => {
    if (forgotPhase !== 'sent') return;
    let iv = setInterval(() => setForgotTimer(t => {
      if (t <= 1) { clearInterval(iv); setCanResendForgot(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [forgotPhase]);

  const handleForgotOtpChange = (i, val) => {
    if (isNaN(val)) return;
    const n = [...forgotOtp]; n[i] = val.slice(-1); setForgotOtp(n);
    if (val && i < 5) forgotOtpRefs.current[i + 1]?.focus();
  };
  const handleForgotOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !forgotOtp[i] && i > 0) forgotOtpRefs.current[i - 1]?.focus();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOk) return setError('Please use your university email (@cgu-odisha.ac.in).');
    if (!password) return setError('Please enter your password.');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        // Legacy account — prompt to reset password
        if (data.needsReset) {
          setForgotPhase('none');
          throw new Error(data.error);
        }
        throw new Error(data.error);
      }
      ctxLogin(data.token, data.user);
      navigate('/rooms');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSendForgotOTP = async () => {
    if (!emailOk) return setError('Please enter your full university email first.');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForgotPhase('sent');
      setForgotTimer(30); setCanResendForgot(false);
      setForgotOtp(['', '', '', '', '', '']);
      setForgotMsg(data.message || `OTP sent to ${email}`);
      if (data.devOtp) setDevOtp(data.devOtp); // dev only: show OTP if email fails
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotOtpStr.length !== 6) return setError('Enter the 6-digit OTP.');
    if (!pwVal.valid) return setError('Password must have 6+ chars, 1 special, 1 number.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: forgotOtpStr, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Auto-login after reset
      ctxLogin(data.token, data.user);
      navigate('/rooms');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  // ── FORGOT PASSWORD UI ──────────────────────────────────────────────────────
  if (forgotPhase === 'sent') {
    return (
      <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <button type="button" onClick={() => { setForgotPhase('none'); setError(''); setDevOtp(''); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontFamily: 'inherit' }}>
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>

        <SuccessMsg msg={forgotMsg} />

        {/* Dev OTP display — only when uni mail bounces */}
        {devOtp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: 'rgba(247,201,72,0.1)', border: '1px solid rgba(247,201,72,0.3)', borderRadius: '8px', padding: '12px 16px', fontSize: '0.8rem', color: '#f7c948' }}>
            ⚠️ Uni email may not receive external mail. Your OTP (dev mode):
            <strong style={{ display: 'block', fontSize: '1.4rem', letterSpacing: '8px', marginTop: '6px', color: '#fff' }}>{devOtp}</strong>
          </motion.div>
        )}

        {/* OTP Boxes */}
        <div>
          <label style={labelStyle}>ENTER OTP FROM YOUR EMAIL</label>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {forgotOtp.map((d, i) => (
              <input key={i} ref={el => forgotOtpRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleForgotOtpChange(i, e.target.value)}
                onKeyDown={e => handleForgotOtpKey(i, e)}
                autoFocus={i === 0}
                style={{
                  width: '48px', height: '58px', textAlign: 'center', fontSize: '1.4rem',
                  fontWeight: '700', background: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${d ? '#e91e63' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px', color: '#fff', outline: 'none',
                  boxShadow: d ? '0 0 12px rgba(233,30,99,0.2)' : 'none', transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            {canResendForgot
              ? <button type="button" onClick={handleSendForgotOTP} style={{ background: 'none', border: 'none', color: '#e91e63', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'inherit' }}>Resend OTP</button>
              : `Resend in ${forgotTimer}s...`}
          </div>
        </div>

        {/* New Password */}
        <div>
          <label style={labelStyle}>NEW PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input type={showNewPass ? 'text' : 'password'} value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setError(''); }}
              placeholder="Min 6 chars, 1 special, 1 number"
              style={{ ...inputStyle, paddingLeft: '44px', paddingRight: '44px' }}
            />
            <button type="button" onClick={() => setShowNewPass(v => !v)}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {newPassword && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
              <Req met={pwVal.minLength} label="At least 6 characters" />
              <Req met={pwVal.hasSpecial} label="At least 1 special character" />
              <Req met={pwVal.hasNumber} label="At least 1 number" />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={labelStyle}>CONFIRM PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input type="password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Re-enter your new password"
              style={{ ...inputStyle, paddingLeft: '44px', borderColor: confirmPassword && confirmPassword !== newPassword ? '#ff6b8a' : confirmPassword && confirmPassword === newPassword ? '#5ec87a' : 'rgba(255,255,255,0.1)' }}
            />
            {confirmPassword && confirmPassword === newPassword && (
              <CheckCircle2 size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#5ec87a' }} />
            )}
          </div>
          {confirmPassword && newPassword !== confirmPassword && <InlineError msg="Passwords do not match" />}
        </div>

        <InlineError msg={error} />

        <button type="submit" disabled={loading || forgotOtpStr.length !== 6 || !pwVal.valid || newPassword !== confirmPassword}
          style={{ ...btnPrimary, opacity: (loading || forgotOtpStr.length !== 6 || !pwVal.valid || newPassword !== confirmPassword) ? 0.5 : 1 }}>
          {loading ? <><Loader2 size={18} className="spin" /> Resetting...</> : <>RESET & ENTER THE VOID <ArrowRight size={18} /></>}
        </button>
      </form>
    );
  }

  // ── NORMAL LOGIN UI ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Email */}
      <div>
        <label style={labelStyle}>UNIVERSITY EMAIL</label>
        <div style={{ position: 'relative' }}>
          <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input type="email" value={email} autoFocus
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="2301020857@cgu-odisha.ac.in"
            style={{ ...inputStyle, paddingLeft: '44px' }}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>PASSWORD</label>
          <button type="button" onClick={handleSendForgotOTP} disabled={loading}
            style={{ background: 'none', border: 'none', color: '#e91e63', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' }}>
            {loading ? 'Sending OTP...' : 'Forgot Password?'}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input type={showPass ? 'text' : 'password'} value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="Your password"
            style={{ ...inputStyle, paddingLeft: '44px', paddingRight: '44px' }}
          />
          <button type="button" onClick={() => setShowPass(v => !v)}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <InlineError msg={error} />

      {/* Prompt to use Forgot Password for legacy accounts */}
      {error && error.includes('old system') && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'rgba(247,201,72,0.08)', border: '1px solid rgba(247,201,72,0.25)', borderRadius: '8px', padding: '12px 16px', fontSize: '0.82rem', color: '#f7c948', lineHeight: '1.5' }}>
          💡 Click <button type="button" onClick={handleSendForgotOTP}
            style={{ background: 'none', border: 'none', color: '#e91e63', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit', fontSize: '0.82rem', textDecoration: 'underline' }}>
            Forgot Password?
          </button> above to set a new password for your account.
        </motion.div>
      )}

      {error.includes('sign up') && (
        <button type="button" onClick={onSwitchToSignup} style={{ ...btnSecondary, border: '1px solid rgba(233,30,99,0.4)' }}>
          Switch to Sign Up →
        </button>
      )}

      <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
        {loading ? <><Loader2 size={18} className="spin" /> Entering the Void...</> : <>ENTER THE VOID <ArrowRight size={18} /></>}
      </button>

      <Divider />
      <OAuthBtn icon="🔵" label="Continue with Google" onClick={() => alert('OAuth coming soon — register Google credentials first.')} />
      <OAuthBtn icon="🍎" label="Continue with Apple" onClick={() => alert('OAuth coming soon — register Apple credentials first.')} />
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6' }}>
        No phone numbers · No real names · No links<br />
        <strong style={{ color: 'rgba(255,255,255,0.5)' }}>OYEEE is zero-identity by design.</strong>
      </p>
    </form>
  );
};

// ─── MAIN AUTH PAGE ───────────────────────────────────────────────────────────
const Auth = () => {
  const [tab, setTab] = useState('signup');
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(233,30,99,0.5) !important; box-shadow: 0 0 0 3px rgba(233,30,99,0.12); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500', fontFamily: 'inherit', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: '700' }}>
          OYEEE<span style={{ color: '#e91e63' }}>.</span>
        </div>
      </div>

      {/* Auth card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '460px' }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ fontSize: '2rem', fontFamily: 'Georgia, serif', fontWeight: '700', marginBottom: '6px' }}>
              OYEEE<span style={{ color: '#e91e63' }}>.</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>one door. infinite anonymity.</p>
          </div>

          {/* Toggle Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { id: 'signup', label: 'SIGN UP', sub: 'For first-time users' },
              { id: 'login', label: 'LOGIN', sub: 'For existing users' }
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '14px 8px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                background: tab === t.id ? '#e91e63' : 'transparent',
                color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
                fontFamily: 'inherit', transition: 'all 0.3s',
                boxShadow: tab === t.id ? '0 4px 20px rgba(233,30,99,0.35)' : 'none'
              }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1.5px' }}>{t.label}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.75, marginTop: '2px' }}>{t.sub}</div>
              </button>
            ))}
          </div>

          {/* Form card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px', minHeight: '200px' }}>
            <AnimatePresence mode="wait">
              {tab === 'signup' ? (
                <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <SignUpForm />
                </motion.div>
              ) : (
                <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <LoginForm onSwitchToSignup={() => setTab('signup')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>
            {tab === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button onClick={() => setTab(tab === 'signup' ? 'login' : 'signup')}
              style={{ background: 'none', border: 'none', color: '#e91e63', cursor: 'pointer', fontWeight: '600', fontSize: '0.78rem', fontFamily: 'inherit' }}>
              {tab === 'signup' ? 'Login →' : 'Sign Up →'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
