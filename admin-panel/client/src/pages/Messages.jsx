import { useEffect, useState } from 'react';
import api from '../api/adminApi';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetch = () => {
    setLoading(true);
    api.get('/messages', { params: { status, limit: 50 } })
      .then(r => { setMessages(r.data.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [status]);

  const removeMsg = async (id) => {
    await api.delete(`/messages/${id}`);
    fetch();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Messages</div>
          <div className="page-subtitle">{messages.length} messages loaded</div>
        </div>
        <select className="form-select" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      <div className="panel">
        {loading ? <div className="loading">Loading messages…</div> : (
          <table>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Room</th>
                <th>Content</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">✉️</div><p>No messages found</p></div></td></tr>
              ) : messages.map(m => (
                <tr key={m._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.senderId}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.roomId}</td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.content}</td>
                  <td><span className={`badge badge-${m.status}`}>{m.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td>
                    {m.status !== 'removed' && (
                      <button className="btn btn-danger btn-sm" onClick={() => removeMsg(m._id)}>Remove</button>
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
