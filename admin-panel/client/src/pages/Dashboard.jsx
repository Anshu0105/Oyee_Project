import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAdminStore } from '../store/adminStore';

export default function Dashboard() {
  const { overview, fetchOverview, liveActivity, pushActivity } = useAdminStore();

  useEffect(() => {
    fetchOverview();

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem('admin_token') }
    });

    socket.on('user:joined',   data => pushActivity({ type: 'join', ...data, time: new Date() }));
    socket.on('message:flagged', data => pushActivity({ type: 'flag', ...data, time: new Date() }));
    socket.on('aura:awarded',  data => pushActivity({ type: 'aura', ...data, time: new Date() }));
    socket.on('user:banned',   data => pushActivity({ type: 'ban',  ...data, time: new Date() }));

    const interval = setInterval(fetchOverview, 30000);
    return () => { socket.disconnect(); clearInterval(interval); };
  }, []);

  const stats = [
    { label: 'Total Users',       value: overview?.totalUsers ?? '—',       icon: '👥', color: 'purple' },
    { label: 'Online Now',        value: overview?.onlineUsers ?? '—',      icon: '🟢', color: 'green'  },
    { label: 'Aura Circulating',  value: overview?.auraCirculating ?? '—',  icon: '⚡', color: 'gold'   },
    { label: 'Messages Today',    value: overview?.todayMessages ?? '—',    icon: '💬', color: 'blue'   },
    { label: 'Pending Flags',     value: overview?.pendingFlags ?? '—',     icon: '🚩', color: 'red'    },
  ];

  const activityLabels = {
    join: { dot: 'join',  text: 'User joined a room' },
    flag: { dot: 'flag',  text: 'Message flagged' },
    ban:  { dot: 'ban',   text: 'User banned' },
    aura: { dot: 'aura',  text: 'Aura awarded' },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Real-time overview of the Oyeee platform</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchOverview}>🔄 Refresh</button>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">🔴 Live Activity Feed</div>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Last {liveActivity.length} events</span>
        </div>
        <div className="live-feed">
          {liveActivity.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📡</div>
              <p>Listening for live events...</p>
            </div>
          ) : liveActivity.map((item, i) => {
            const meta = activityLabels[item.type] || { dot: 'aura', text: 'Event' };
            return (
              <div key={i} className="live-item">
                <div className={`live-dot ${meta.dot}`} />
                <div>
                  <span style={{ color: 'var(--text-primary)' }}>{meta.text}</span>
                  {item.userId && <span style={{ color: 'var(--text-dim)', marginLeft: 6 }}>#{item.userId}</span>}
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 11 }}>
                  {item.time ? new Date(item.time).toLocaleTimeString() : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
