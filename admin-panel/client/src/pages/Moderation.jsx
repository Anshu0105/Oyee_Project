import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

export default function Moderation() {
  const { flaggedMessages, fetchFlagged, approveMessage, removeMessage, removeBanUser } = useAdminStore();

  useEffect(() => { fetchFlagged(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Moderation</div>
          <div className="page-subtitle">{flaggedMessages.length} flagged messages</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchFlagged}>🔄 Refresh</button>
      </div>

      {flaggedMessages.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No flagged messages — all clear!</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {flaggedMessages.map(m => (
            <div key={m._id} className="panel" style={{ padding: 20 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="badge badge-flagged">🚩 Flagged</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'monospace' }}>#{m.senderId}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 'auto' }}>
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>

              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 14,
                marginBottom: 12,
                lineHeight: 1.5
              }}>
                {m.content}
              </div>

              {m.flagReason && (
                <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 12 }}>
                  ⚠️ Reason: {m.flagReason}
                </div>
              )}

              <div className="flex gap-2">
                <button className="btn btn-success btn-sm" onClick={() => approveMessage(m._id)}>✅ Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeMessage(m._id)}>🗑 Remove</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeBanUser(m._id)}>🔨 Remove + Ban</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
