import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/adminStore';

export default function Broadcast() {
  const { broadcasts, fetchBroadcasts, sendBroadcast } = useAdminStore();
  const [form, setForm] = useState({ message: '', target: 'all', duration: 30 });
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchBroadcasts(); }, []);

  const handleSend = async () => {
    if (!form.message.trim()) return;
    setSending(true);
    await sendBroadcast(form);
    setForm({ message: '', target: 'all', duration: 30 });
    setSending(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Broadcast</div>
          <div className="page-subtitle">Send system-wide announcements</div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        <div className="panel" style={{ padding: 24 }}>
          <div className="panel-title" style={{ marginBottom: 20 }}>📢 New Broadcast</div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              placeholder="Type your announcement…"
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              style={{ minHeight: 100 }}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target</label>
              <select className="form-select" value={form.target} onChange={e => setForm({...form, target: e.target.value})}>
                <option value="all">All Users</option>
                <option value="wifi">WiFi Rooms</option>
                <option value="university">University</option>
                <option value="nearby">Nearby</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (seconds)</label>
              <input type="number" className="form-input" value={form.duration} onChange={e => setForm({...form, duration: +e.target.value})} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSend} disabled={sending}>
            {sending ? '⏳ Sending…' : '📢 Send Broadcast'}
          </button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📋 Recent Broadcasts</div>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {broadcasts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📢</div>
                <p>No broadcasts sent yet</p>
              </div>
            ) : broadcasts.map(b => (
              <div key={b._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{b.message}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-dim)' }}>
                  <span>🎯 {b.target}</span>
                  <span>⏱ {b.duration}s</span>
                  <span style={{ marginLeft: 'auto' }}>{new Date(b.sentAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
