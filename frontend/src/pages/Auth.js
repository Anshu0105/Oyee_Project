import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, XCircle,
  Mail, Lock, AlertCircle, ArrowRight, Check
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

const validateEmail = (email) => email.endsWith('@cgu-odisha.ac.in');
const validatePassword = (pw) => ({
  minLength: pw.length >= 6,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  hasNumber: /\d/.test(pw),
  get valid() { return this.minLength && this.hasSpecial && this.hasNumber; }
});

const Req = ({ met, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: met ? '#5ec87a' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
    {met ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
    {label}
  </div>
);

const OAuthBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '500',
    transition: 'all 0.2s', fontFamily: 'inherit'
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
  >
    <span style={{ fontSize: '1.1rem' }}>{icon}</span>{label}
  </button>
);

const InlineError = ({ msg }) => msg ? (
  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b8a', fontSize: '0.8rem', marginTop: '8px', fontWeight: '500' }}>
    <AlertCircle size={14} /> {msg}
  </motion.div>
) : null;

const SuccessMsg = ({ msg }) => msg ? (
  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5ec87a', fontSize: '0.8rem', marginTop: '8px', fontWeight: '500', background: 'rgba(94,200,122,0.08)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(94,200,122,0.2)' }}>
    <Check size={14} /> {msg}
  </motion.div>
) : null;

// ─── SIGN UP FORM ───────────────────────────────────────────────────
const SignUpForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [terms, setTerms] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setSuccess(`✓ OTP sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Is the backend running?');
    } finally { setOtpLoading(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!terms) return setError('Please accept the Terms of Service to continue.');
    if (otpStr.length !== 6) return setError('Please enter the 6-digit OTP.');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp: otpStr })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      ctxLogin(data.token, data.user);
      navigate('/rooms');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Email */}
      <div>
        <label style={labelStyle}>UNIVERSITY EMAIL</label>
        <div style={{ position: 'relative' }}>
          <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input
            type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="2301020857@cgu-odisha.ac.in"
            style={{ ...inputStyle, paddingLeft: '44px', borderColor: email && !emailOk ? '#ff6b8a' : email && emailOk ? '#5ec87a' : 'rgba(255,255,255,0.1)' }}
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
          <input
            type={showPass ? 'text' : 'password'} value={password}
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

      {/* Get OTP / Resend */}
      {!otpSent ? (
        <button type="button" onClick={handleSendOTP} disabled={otpLoading || !emailOk || !pwVal.valid}
          style={{ ...btnSecondary, opacity: (!emailOk || !pwVal.valid) ? 0.5 : 1 }}>
          {otpLoading ? <><Loader2 size={16} className="spin" /> Sending OTP...</> : 'Get OTP →'}
        </button>
      ) : (
        <>
          <SuccessMsg msg={success} />
          {/* OTP Boxes */}
          <div>
            <label style={labelStyle}>ENTER 6-DIGIT OTP</label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {otp.map((d, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  style={{
                    width: '52px', height: '60px', textAlign: 'center', fontSize: '1.5rem',
                    fontWeight: '700', background: 'rgba(255,255,255,0.05)',
                    border: `2px solid ${d ? '#e91e63' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', color: '#fff', outline: 'none',
                    boxShadow: d ? '0 0 12px rgba(233,30,99,0.2)' : 'none', transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', opacity: 0.5 }}>
              {canResend
                ? <button type="button" onClick={handleSendOTP} style={{ background: 'none', border: 'none', color: '#e91e63', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Resend OTP</button>
                : `Resend in ${timer}s...`}
            </div>
          </div>

          {/* Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#e91e63', width: '16px', height: '16px', cursor: 'pointer' }} />
            I agree to the <span style={{ color: '#e91e63', textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: '#e91e63', textDecoration: 'underline' }}>Privacy Policy</span>. By entering, you remain 100% anonymous.
          </label>

          <InlineError msg={error} />

          {/* Enter the Void */}
          <button type="submit" disabled={loading || otpStr.length !== 6 || !terms}
            style={{ ...btnPrimary, opacity: (loading || otpStr.length !== 6 || !terms) ? 0.5 : 1 }}>
            {loading ? <><Loader2 size={18} className="spin" /> Entering the Void...</> : <>ENTER THE VOID <ArrowRight size={18} /></>}
          </button>
        </>
      )}

      {!otpSent && <InlineError msg={error} />}

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

// ─── LOGIN FORM ─────────────────────────────────────────────────────
const LoginForm = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();
  const { login: ctxLogin } = useUser();

  const emailOk = validateEmail(email);

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
      if (!res.ok) throw new Error(data.error);
      ctxLogin(data.token, data.user);
      navigate('/rooms');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleForgot = async () => {
    if (!emailOk) return setError('Enter your university email first to reset password.');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForgotSent(true);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Email */}
      <div>
        <label style={labelStyle}>UNIVERSITY EMAIL</label>
        <div style={{ position: 'relative' }}>
          <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input type="email" value={email}
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
          <button type="button" onClick={handleForgot}
            style={{ background: 'none', border: 'none', color: '#e91e63', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
            Forgot Password?
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

      {forgotSent && <SuccessMsg msg={`Password reset OTP sent to ${email}. Check your inbox.`} />}
      <InlineError msg={error} />

      {/* No account found → switch */}
      {error.includes('sign up') && (
        <button type="button" onClick={onSwitchToSignup}
          style={{ ...btnSecondary, background: 'none', border: '1px solid rgba(233,30,99,0.4)', color: '#e91e63' }}>
          Switch to Sign Up →
        </button>
      )}

      <button type="submit" disabled={loading}
        style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
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

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: '500' }}>OR</span>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
  </div>
);

// ─── Shared styles ────────────────────────────────────────────────────
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
  alignItems: 'center', justifyContent: 'center', gap: '10px',
  transition: 'all 0.3s', fontFamily: 'inherit'
};
const btnSecondary = {
  width: '100%', padding: '14px', background: 'rgba(233,30,99,0.1)',
  color: '#e91e63', border: '1px solid rgba(233,30,99,0.3)', borderRadius: '10px',
  fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '8px',
  transition: 'all 0.2s', fontFamily: 'inherit'
};

// ─── MAIN AUTH PAGE ───────────────────────────────────────────────────
const Auth = () => {
  const [tab, setTab] = useState('signup'); // 'signup' | 'login'
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(233,30,99,0.5) !important; box-shadow: 0 0 0 3px rgba(233,30,99,0.12); }
        .tab-btn { transition: all 0.3s; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500', fontFamily: 'inherit', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: '700' }}>
          OYEEE<span style={{ color: '#e91e63' }}>.</span>
        </div>
      </div>

      {/* Center auth card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '460px' }}
        >
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
              <button key={t.id} className="tab-btn"
                onClick={() => setTab(t.id)}
                style={{
                  padding: '14px 8px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                  background: tab === t.id ? '#e91e63' : 'transparent',
                  color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'inherit', transition: 'all 0.3s',
                  boxShadow: tab === t.id ? '0 4px 20px rgba(233,30,99,0.35)' : 'none'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1.5px' }}>{t.label}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.75, marginTop: '2px' }}>{t.sub}</div>
              </button>
            ))}
          </div>

          {/* Forms */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px' }}>
            <AnimatePresence mode="wait">
              {tab === 'signup' ? (
                <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <SignUpForm onSuccess={() => {}} />
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
