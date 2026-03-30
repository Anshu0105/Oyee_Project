import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

const tierEmojis = { ghost: '👻', rising: '🌟', thunder: '⚡', starborn: '🌠' };

export default function Leaderboard() {
  const { leaderboard, fetchLeaderboard } = useAdminStore();

  useEffect(() => { fetchLeaderboard(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Leaderboard</div>
          <div className="page-subtitle">Top users by Aura Points</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchLeaderboard}>🔄 Refresh</button>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Identity</th>
              <th>User ID</th>
              <th>Tier</th>
              <th>Aura Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🏆</div><p>No leaderboard data yet</p></div></td></tr>
            ) : leaderboard.map((u, i) => (
              <tr key={u.userId}>
                <td>
                  <span style={{
                    fontWeight: 800,
                    color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--text-dim)',
                    fontSize: 15
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{u.identity || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{u.userId}</td>
                <td>
                  <span className={`badge badge-${u.tier}`}>
                    {tierEmojis[u.tier]} {u.tier}
                  </span>
                </td>
                <td style={{ color: '#f59e0b', fontWeight: 700, fontSize: 15 }}>⚡ {u.auraPoints.toLocaleString()}</td>
                <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
