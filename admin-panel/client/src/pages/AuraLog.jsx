import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

const typeColors = { earned: 'green', spent: 'red', admin: 'purple', penalty: 'red' };

export default function AuraLog() {
  const { auraLog, fetchAuraLog } = useAdminStore();

  useEffect(() => { fetchAuraLog(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Aura Log</div>
          <div className="page-subtitle">All aura point transactions</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => fetchAuraLog()}>🔄 Refresh</button>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User ID</th>
              <th>Change</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {auraLog.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-icon">⚡</div>
                  <p>No aura logs yet</p>
                </div>
              </td></tr>
            ) : auraLog.map(log => (
              <tr key={log._id}>
                <td style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.userId}</td>
                <td style={{ fontWeight: 700, color: log.change > 0 ? 'var(--green)' : 'var(--red)', fontSize: 15 }}>
                  {log.change > 0 ? '+' : ''}{log.change}
                </td>
                <td><span className={`badge badge-${typeColors[log.type]}`}>{log.type}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{log.reason || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)' }}>{log.adminId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
