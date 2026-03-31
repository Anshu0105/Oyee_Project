import React from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [empid, setEmpid] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [role, setRole] = React.useState('Super Admin');
  const [error, setError] = React.useState(false);

  const doLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/user/login', { username: empid, password: pass });
      localStorage.setItem('token', res.data.token);
      onLogin({ name: empid, role });
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div id="login-page">
      <div className="login-grid-bg"></div>
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">OYEEE<span>.</span></div>
          <div className="login-logo-sub">// Employee Administration Portal</div>
        </div>
        <div className="login-features">
          <div className="lf-item">
            <div className="lf-icon">🛡️</div>
            <div>
              <div className="lf-label">Safety & Moderation</div>
              <div className="lf-sub">Real-time violation monitoring</div>
            </div>
          </div>
          <div className="lf-item">
            <div className="lf-icon">📊</div>
            <div>
              <div className="lf-label">Analytics & Graphs</div>
              <div className="lf-sub">Live platform insights</div>
            </div>
          </div>
          <div className="lf-item">
            <div className="lf-icon">📢</div>
            <div>
              <div className="lf-label">Live Declarations</div>
              <div className="lf-sub">Broadcast to all active users</div>
            </div>
          </div>
          <div className="lf-item">
            <div className="lf-icon">🔔</div>
            <div>
              <div className="lf-label">Push Notifications</div>
              <div className="lf-sub">Target users by segment</div>
            </div>
          </div>
        </div>
        <div className="login-version">OYEEE ADMIN · v3.1.0 · CONFIDENTIAL</div>
      </div>

      <div className="login-right">
        <div className="login-form-head">
          <div className="login-form-title">EMPLOYEE<br />LOGIN</div>
          <div className="login-form-sub">// restricted access · authorised personnel only</div>
          <div className="login-emp-badge">🔐 OYEEE STAFF PORTAL</div>
        </div>

        <div className="form-group">
          <label className="form-label">Select Role</label>
          <div className="emp-select">
            <div className={`emp-opt ${role === 'Super Admin' ? 'sel' : ''}`} onClick={() => setRole('Super Admin')}>
              <span className="emp-opt-icon">👑</span>
              <span className="emp-opt-label">SUPER ADMIN</span>
            </div>
            <div className={`emp-opt ${role === 'Moderator' ? 'sel' : ''}`} onClick={() => setRole('Moderator')}>
              <span className="emp-opt-icon">🛡️</span>
              <span className="emp-opt-label">MODERATOR</span>
            </div>
            <div className={`emp-opt ${role === 'Analyst' ? 'sel' : ''}`} onClick={() => setRole('Analyst')}>
              <span className="emp-opt-icon">📊</span>
              <span className="emp-opt-label">ANALYST</span>
            </div>
            <div className={`emp-opt ${role === 'Support' ? 'sel' : ''}`} onClick={() => setRole('Support')}>
              <span className="emp-opt-icon">💬</span>
              <span className="emp-opt-label">SUPPORT</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Employee ID</label>
          <input className="form-inp" value={empid} onChange={e => setEmpid(e.target.value)} placeholder="EMP-001" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-inp" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>

        <button className="login-btn" onClick={doLogin}>ACCESS PORTAL →</button>
        <div className={`login-error ${error ? 'show' : ''}`}>⚠ Invalid credentials. Please try again.</div>

        <div className="login-creds">
          <div className="login-creds-title">DEMO CREDENTIALS</div>
          <div className="cred-row"><span className="cred-role">SUPER ADMIN</span><span>EMP-001 / admin123</span></div>
          <div className="cred-row"><span className="cred-role">MODERATOR</span><span>EMP-002 / mod456</span></div>
          <div className="cred-row"><span className="cred-role">ANALYST</span><span>EMP-003 / ana789</span></div>
          <div className="cred-row"><span className="cred-role">SUPPORT</span><span>EMP-004 / sup321</span></div>
        </div>
      </div>
    </div>
  );
};

export default Login;