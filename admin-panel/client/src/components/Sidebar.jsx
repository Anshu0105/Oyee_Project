import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/users', icon: '👥', label: 'Users', badgeText: '247' },
  { path: '/rooms', icon: '💬', label: 'Rooms', badgeText: '4' },
  { path: '/messages', icon: '✉️', label: 'Messages', badgeText: '1.2k' },
  { path: '/moderation', icon: '🛡️', label: 'Moderation', badgeText: '3' },
  { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { path: '/store', icon: '🛒', label: 'Aura Store' },
  { path: '/aura-log', icon: '⚡', label: 'Aura Log' },
  { path: '/broadcast', icon: '📢', label: 'Broadcast' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const renderNavSection = (items) => (
    items.map(item => (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === '/'}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="nav-item-left">
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </div>
        {item.badgeText && <span className="nav-item-badge">{item.badgeText}</span>}
      </NavLink>
    ))
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>OYEE.</h1>
        <span className="sidebar-badge">ADMIN</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">OVERVIEW</div>
        {renderNavSection(navItems.slice(0, 2))}

        <div className="nav-section-label">MANAGEMENT</div>
        {renderNavSection(navItems.slice(2, 6))}

        <div className="nav-section-label">AURA SYSTEM</div>
        {renderNavSection(navItems.slice(6, 9))}

        <div className="nav-section-label">SYSTEM</div>
        {renderNavSection(navItems.slice(9))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-avatar">
          {adminUser.identity ? adminUser.identity[0].toUpperCase() : 'A'}
        </div>
        <div className="admin-info">
          <div className="admin-name">{adminUser.identity || 'ADMIN_VOID'}</div>
          <div className="admin-role">// SUPER ADMIN</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Disconnect">
          <span style={{ fontSize: 20 }}>⏻</span>
        </button>
      </div>
    </aside>
  );
}
