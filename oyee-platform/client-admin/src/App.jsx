import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Analytics from './views/Analytics';
import Moderation from './views/Moderation';
import Declarations from './views/Declarations';
import Notifications from './views/Notifications';
import Announcements from './views/Announcements';
import Users from './views/Users';
import Aura from './views/Aura';
import Store from './views/Store';
import Rooms from './views/Rooms';
import Blacklist from './views/Blacklist';
import Bot from './views/Bot';
import Employees from './views/Employees';
import AI from './views/AI';
import Audit from './views/Audit';
import Health from './views/Health';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loggedIn, setLoggedIn] = useState(!!user);
  const [currentPanel, setCurrentPanel] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'classic');

  React.useEffect(() => {
    if (theme === 'royal') {
      document.body.classList.add('theme-royal');
    } else {
      document.body.classList.remove('theme-royal');
    }
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  React.useEffect(() => {
    window.toast = (title, msg) => {
      setToastMsg({ title, msg });
      setTimeout(() => setToastMsg(null), 3500);
    };
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setUser(userData);
    setLoggedIn(true);
    if(window.toast) window.toast('AUTH', 'Login Successful.');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    setUser(null);
    setLoggedIn(false);
  };

  const views = {
    dashboard: Dashboard,
    analytics: Analytics,
    moderation: Moderation,
    declarations: Declarations,
    notifications: Notifications,
    announcements: Announcements,
    users: Users,
    aura: Aura,
    store: Store,
    rooms: Rooms,
    blacklist: Blacklist,
    bot: Bot,
    employees: Employees,
    ai: AI,
    audit: Audit,
    health: Health,
  };

  const CurrentView = views[currentPanel] || Dashboard;

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div id="app-shell">
      <Sidebar activePanel={currentPanel} onPanelChange={setCurrentPanel} user={user} isSidebarOpen={isSidebarOpen} onLogout={handleLogout} />
      <div className={`main-area ${!isSidebarOpen ? 'expanded' : ''}`}>
        <div className="topbar">
          <button 
            style={{background:'transparent', border:'none', fontSize:'24px', cursor:'pointer', color:'var(--ink)', marginRight:'12px'}}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <div className="tb-title">{currentPanel.toUpperCase()}<span></span></div>
          <div className="tb-stat"><div className="tb-dot g"></div><span>3,241</span> Users Online</div>
          <div className="tb-sep"></div>
          <div className="tb-stat"><div className="tb-dot r"></div><span>12</span> Violations</div>
          <div className="tb-sep"></div>
          <div className="tb-stat"><div className="tb-dot a"></div>99.8% Uptime</div>
          <div className="tb-sep"></div>
          <div className="tb-emp">
            <div className="tb-emp-av">{user ? user.name[0] : 'A'}</div>
            <div><div className="tb-emp-info">{user ? user.name : 'Admin_01'}</div><div className="tb-emp-role">{user ? user.role : 'SUPER ADMIN'}</div></div>
          </div>
          <button 
            className="btn sm" 
            onClick={() => {
              const newTheme = theme === 'classic' ? 'royal' : 'classic';
              setTheme(newTheme);
              window.toast && window.toast('THEME', `Switched to ${newTheme} theme`);
            }}
          >
            🎨 {theme === 'classic' ? 'ROYAL THEME' : 'CLASSIC FIRE'}
          </button>
          <button className="btn p sm btn-icon" onClick={() => setCurrentPanel('declarations')}>📢 DECLARE</button>
          <button className="btn b sm btn-icon" onClick={() => setCurrentPanel('notifications')}>🔔 NOTIFY</button>
        </div>

        <div className="ticker">
          <div className="ticker-lbl">⚠ LIVE</div>
          <div className="ticker-inner">VIOLATION: Spicy Ramen · phone number blocked · ACTIVE ROOMS: 47 · PEAK HOUR: 2AM · NEW USERS TODAY: +148 · AURA ECONOMY HEALTHY · 3,241 USERS ONLINE · STORE: 7 ORDERS PENDING ·</div>
        </div>

        <div className="content">
          <CurrentView />
        </div>
      </div>
      {toastMsg && (
        <div className="toast">
          <div className="tt">{toastMsg.title}</div>
          {toastMsg.msg}
        </div>
      )}
    </div>
  );
}

export default App;