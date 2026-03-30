import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/adminStore';

export default function Users() {
  const { users, fetchUsers, banUser, unbanUser, loading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null); // { type:'ban', userId }
  const [banReason, setBanReason] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = () => fetchUsers({ search, tier, status });

  const handleBan = async () => {
    await banUser(modal.userId, banReason);
    setModal(null); setBanReason('');
  };

  const tierBadge = t => <span className={`badge badge-${t}`}>{t}</span>;
  const statusBadge = s => <span className={`badge badge-${s}`}>{s}</span>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">{users.length} users loaded</div>
        </div>
      </div>

      <div className="search-bar">
        <input className="form-input" placeholder="Search by identity…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <select className="form-select" style={{ width: 140 }} value={tier} onChange={e => setTier(e.target.value)}>
          <option value="">All Tiers</option>
          <option value="ghost">Ghost</option>
          <option value="rising">Rising</option>
          <option value="thunder">Thunder</option>
          <option value="starborn">Starborn</option>
        </select>
        <select className="form-select" style={{ width: 140 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="banned">Banned</option>
        </select>
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      <div className="panel">
        {loading ? <div className="loading">Loading users…</div> : (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Identity</th>
                <th>Tier</th>
                <th>Aura</th>
                <th>Status</th>
                <th>Warnings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">👤</div><p>No users found</p></div></td></tr>
              ) : users.map(u => (
                <tr key={u.userId}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: 12 }}>{u.userId}</td>
                  <td style={{ fontWeight: 600 }}>{u.identity || '—'}</td>
                  <td>{tierBadge(u.tier)}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 700 }}>⚡ {u.auraPoints}</td>
                  <td>{statusBadge(u.status)}</td>
                  <td style={{ color: u.warnings > 0 ? 'var(--red)' : 'var(--text-dim)' }}>{u.warnings}</td>
                  <td>
                    <div className="flex gap-2">
                      {u.status === 'banned'
                        ? <button className="btn btn-success btn-sm" onClick={() => unbanUser(u.userId)}>Unban</button>
                        : <button className="btn btn-danger btn-sm" onClick={() => setModal({ type: 'ban', userId: u.userId })}>Ban</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'ban' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🚫 Ban User: {modal.userId}</div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <input className="form-input" placeholder="Reason for ban…" value={banReason} onChange={e => setBanReason(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleBan}>Confirm Ban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
