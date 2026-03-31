import React from 'react';

const Sidebar = ({ activePanel, onPanelChange, user, isSidebarOpen, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'moderation', icon: '🛡️', label: 'Moderation', badge: 12 },
    { id: 'declarations', icon: '📢', label: 'Live Declarations' },
    { id: 'notifications', icon: '🔔', label: 'Push Notifications', badge: 3 },
    { id: 'announcements', icon: '📡', label: 'Announcements' },
    { id: 'users', icon: '👥', label: 'All Users' },
    { id: 'aura', icon: '⚡', label: 'Aura & Economy' },
    { id: 'store', icon: '🛍️', label: 'Store & Orders' },
    { id: 'rooms', icon: '💬', label: 'Rooms' },
    { id: 'blacklist', icon: '🚫', label: 'Blacklist' },
    { id: 'bot', icon: '🤖', label: 'Bot Rules' },
    { id: 'employees', icon: '👔', label: 'Employees' },
    { id: 'ai', icon: '✦', label: 'AI Assistant' },
    { id: 'audit', icon: '📋', label: 'Audit Log' },
    { id: 'health', icon: '💻', label: 'System Health' },
  ];

  const core = navItems.slice(0, 3);
  const comm = navItems.slice(3, 6);
  const plat = navItems.slice(6, 12);
  const admin = navItems.slice(12);

  return (
    <aside className={`sidebar ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
      <div className="s-logo">
        <div className="s-mark">O</div>
        <div>
          <div className="s-name">OYEEE</div>
          <div className="s-ver">ADMIN · v3.1</div>
        </div>
      </div>

      <div className="s-sec">Core</div>
      {core.map(item => (
        <div key={item.id} className={`nav ${activePanel === item.id ? 'active' : ''}`} onClick={() => onPanelChange(item.id)}>
          <span className="nav-icon">{item.icon}</span>
          {item.label}
          {item.badge && <span className="nav-badge">{item.badge}</span>}
        </div>
      ))}

      <div className="s-sec">Communications</div>
      {comm.map(item => (
        <div key={item.id} className={`nav ${activePanel === item.id ? 'active' : ''}`} onClick={() => onPanelChange(item.id)}>
          <span className="nav-icon">{item.icon}</span>
          {item.label}
          {item.badge && <span className="nav-badge">{item.badge}</span>}
        </div>
      ))}

      <div className="s-sec">Platform</div>
      {plat.map(item => (
        <div key={item.id} className={`nav ${activePanel === item.id ? 'active' : ''}`} onClick={() => onPanelChange(item.id)}>
          <span className="nav-icon">{item.icon}</span>
          {item.label}
          {item.badge && <span className="nav-badge">{item.badge}</span>}
        </div>
      ))}

      <div className="s-sec">Admin</div>
      {admin.map(item => (
        <div key={item.id} className={`nav ${activePanel === item.id ? 'active' : ''}`} onClick={() => onPanelChange(item.id)}>
          <span className="nav-icon">{item.icon}</span>
          {item.label}
          {item.badge && <span className="nav-badge">{item.badge}</span>}
        </div>
      ))}

      <div className="s-foot">
        <div className="s-user">
          <div className="s-av">{user ? user.name[0] : 'A'}</div>
          <div>
            <div className="s-uname">{user ? user.name : 'Admin_01'}</div>
            <div className="s-urole">{user ? user.role : 'SUPER ADMIN'}</div>
          </div>
          <div className="s-online"></div>
        </div>
        <button className="s-logout" onClick={onLogout}>⏻ LOGOUT</button>
      </div>
    </aside>
  );
};

export default Sidebar;