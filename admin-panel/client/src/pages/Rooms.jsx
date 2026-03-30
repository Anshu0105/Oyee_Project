import { useEffect, useState } from 'react';
import api from '../api/adminApi';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/rooms').then(r => { setRooms(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const closeRoom = async (roomId) => {
    await api.post(`/rooms/${roomId}/close`);
    fetch();
  };

  const typeColors = { wifi: 'blue', university: 'purple', nearby: 'green', dm: 'gold' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Rooms</div>
          <div className="page-subtitle">{rooms.length} active rooms</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetch}>🔄 Refresh</button>
      </div>

      <div className="panel">
        {loading ? <div className="loading">Loading rooms…</div> : (
          <table>
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Active Users</th>
                <th>Messages</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">💬</div><p>No rooms found</p></div></td></tr>
              ) : rooms.map(r => (
                <tr key={r.roomId}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{r.roomId}</td>
                  <td><span className={`badge badge-${typeColors[r.type] || 'ghost'}`}>{r.type}</span></td>
                  <td>{r.name || '—'}</td>
                  <td>{r.activeUsers?.length || 0}</td>
                  <td>{r.messageCount}</td>
                  <td><span className={`badge ${r.isActive ? 'badge-active' : 'badge-removed'}`}>{r.isActive ? 'Active' : 'Closed'}</span></td>
                  <td>
                    {r.isActive && (
                      <button className="btn btn-danger btn-sm" onClick={() => closeRoom(r.roomId)}>Close</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
