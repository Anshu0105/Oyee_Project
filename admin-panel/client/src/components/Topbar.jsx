import { useLocation } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';

const titles = {
  '/': 'DASHBOARD',
  '/analytics': 'ANALYTICS',
  '/users': 'USERS',
  '/rooms': 'ROOMS',
  '/messages': 'MESSAGES',
  '/moderation': 'MODERATION',
  '/leaderboard': 'LEADERBOARD',
  '/store': 'AURA STORE',
  '/aura-log': 'AURA LOG',
  '/broadcast': 'BROADCAST',
  '/settings': 'SETTINGS',
};

const subtitles = {
  '/': '// platform overview',
  '/analytics': '// deep void metrics',
  '/users': '// user directory & control',
  '/rooms': '// signal coverage zones',
  '/messages': '// real-time feed intercepts',
  '/moderation': '// signal anomaly detection',
  '/leaderboard': '// top node operators',
  '/store': '// economy management',
  '/aura-log': '// currency tracing',
  '/broadcast': '// global transmission',
  '/settings': '// core system config',
};

export default function Topbar() {
  const location = useLocation();
  const title = titles[location.pathname] || 'ADMIN PANEL';
  const subtitle = subtitles[location.pathname] || '// system core';
  
  const { overview } = useAdminStore();
  const totalUsers = overview?.totalUsers || 247;
  const circulatingAura = overview?.auraCirculating || 1842;
  const messagesToday = overview?.todayMessages || 384;
  const flags = overview?.pendingFlags || 3;

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar-title">
            {title}
            <span className="topbar-subtitle">{subtitle}</span>
          </div>
        </div>
      </header>
      
      {/* Ticker Bar placed directly under Topbar */}
      <div className="ticker-bar">
        <div className="ticker-content" style={{ animation: 'marquee 25s linear infinite' }}>
          <div className="ticker-item">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>USERS</span>
            <span style={{ color: '#fff' }}>{totalUsers} ACTIVE USERS</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'var(--gold)' }}>⚡ {circulatingAura.toLocaleString()} AURA POINTS IN CIRCULATION</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>💬 {messagesToday} MESSAGES TODAY</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>🚩 {flags} FLAGS PENDING REVIEW</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'var(--green)' }}>🔓 VOID IS OPEN</span>
          </div>
          
          {/* Duplicate for seamless scrolling */}
          <div className="ticker-item">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>USERS</span>
            <span style={{ color: '#fff' }}>{totalUsers} ACTIVE USERS</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'var(--gold)' }}>⚡ {circulatingAura.toLocaleString()} AURA POINTS IN CIRCULATION</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>💬 {messagesToday} MESSAGES TODAY</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>🚩 {flags} FLAGS PENDING REVIEW</span>
          </div>
          <div className="ticker-item">
            <span style={{ color: 'var(--green)' }}>🔓 VOID IS OPEN</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
