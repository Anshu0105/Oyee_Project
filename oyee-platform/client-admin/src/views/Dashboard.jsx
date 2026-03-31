import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KpiCards from '../components/KpiCards';
import Charts from '../components/Charts';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [declarations, setDeclarations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchDeclarations();
    fetchNotifications();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeclarations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/declarations/declarations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeclarations(res.data.filter(d => d.status === 'active'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const kpis = [
    { stripe: 'red', icon: '👥', label: 'Active Users', val: stats.activeUsers?.toLocaleString() || '3,241', delta: '↑ +148 today', deltaClass: 'up' },
    { stripe: 'green', icon: '💬', label: 'Messages Today', val: '18.4K', valClass: 'green', delta: '↑ +2.1K vs avg', deltaClass: 'up' },
    { stripe: 'red', icon: '🛡️', label: 'Violations', val: stats.violationCount?.toString() || '12', valClass: 'red', delta: '↑ +4 this hour', deltaClass: 'dn' },
    { stripe: 'amber', icon: '⚡', label: 'Aura Printed', val: stats.auraPrinted?.toLocaleString() || '84.2K', delta: `vs ${stats.auraBurned?.toLocaleString() || '12.4K'} burned`, deltaClass: 'up' },
    { stripe: 'blue', icon: '🛍️', label: 'Store Orders', val: stats.orderCount?.toString() || '87', valClass: 'blue', delta: `${stats.pendingOrders || 7} pending` },
  ];

  return (
    <div className="panel active" id="panel-dashboard">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">COMMAND <span>DASHBOARD</span></div>
          <div className="ph-sub">// real-time platform overview · {new Date().toLocaleDateString()}</div>
          <div className="ph-line"></div>
        </div>
        <div className="ph-actions">
          <button className="btn p sm btn-icon">📢 Live Declaration</button>
          <button className="btn b sm btn-icon">🔔 Push Notification</button>
        </div>
      </div>

      <KpiCards kpis={kpis} />

      <Charts />

      <div className="g2">
        <div className="card">
          <div className="card-accent"></div>
          <div className="ct">LIVE DECLARATION FEED</div>
          <div className="cs">// currently active declarations shown to users</div>
          <div id="live-decl-feed">
            {declarations.map(d => (
              <div key={d._id} className="decl-live">
                <div className="decl-live-bar"></div>
                <div className="decl-header">
                  <div className="decl-live-dot"></div>
                  <div className="decl-label">LIVE DECLARATION</div>
                  <span className="badge r">Active</span>
                </div>
                <div style={{fontFamily: 'var(--fh)', fontSize: '18px', letterSpacing: '2px', color: 'var(--red)', marginBottom: '6px'}}>{d.title}</div>
                <div className="decl-text">{d.message}</div>
                <div className="decl-meta">TARGET: {d.target} · EXPIRES: {d.duration} · Sent {new Date(d.createdAt).toLocaleString()}</div>
                <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                  <button className="btn xs d">✕ REMOVE</button>
                  <button className="btn xs">EDIT</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn p sm btn-icon" style={{marginTop: '10px'}}> + New Declaration</button>
        </div>
        <div className="card">
          <div className="card-accent blue"></div>
          <div className="ct">RECENT NOTIFICATIONS SENT</div>
          <div className="cs">// last 5 push notifications</div>
          <div id="recent-notifs">
            {notifications.map(n => (
              <div key={n._id} className="notif-item">
                <div className="notif-icon-wrap b">{n.type}</div>
                <div className="notif-body">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-meta">{n.segment} · {new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <span className="badge g">SENT</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;