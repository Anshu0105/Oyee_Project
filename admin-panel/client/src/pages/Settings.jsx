import { useEffect, useState } from 'react';
import api from '../api/adminApi';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.put('/settings', settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <div className="loading">Loading settings…</div>;

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Platform configuration</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Saving…' : saved ? '✅ Saved!' : '💾 Save Settings'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        {[
          { key: 'maintenanceMode', label: '🔧 Maintenance Mode', desc: 'Prevent new users from connecting' },
          { key: 'registrationOpen', label: '🚪 Registration Open', desc: 'Allow new user registrations' },
          { key: 'auraDecayEnabled', label: '📉 Aura Decay', desc: 'Gradually reduce inactive users\' aura' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="panel" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</div>
            </div>
            <div
              onClick={() => toggle(key)}
              style={{
                width: 48, height: 26,
                borderRadius: 13,
                background: settings[key] ? 'var(--accent)' : 'var(--bg-hover)',
                cursor: 'pointer',
                position: 'relative',
                transition: '0.2s',
                border: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                width: 18, height: 18,
                background: '#fff',
                borderRadius: '50%',
                top: 3,
                left: settings[key] ? 26 : 4,
                transition: '0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
              }} />
            </div>
          </div>
        ))}

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>⚙️ Numeric Settings</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Max Room Size</label>
              <input type="number" className="form-input" value={settings.maxRoomSize || 50}
                onChange={e => setSettings(s => ({...s, maxRoomSize: +e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Chat Rate Limit (msg/min)</label>
              <input type="number" className="form-input" value={settings.chatRateLimit || 10}
                onChange={e => setSettings(s => ({...s, chatRateLimit: +e.target.value}))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
