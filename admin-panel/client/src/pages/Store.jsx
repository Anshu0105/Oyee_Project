import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import api from '../api/adminApi';

export default function Store() {
  const { storeItems, fetchStoreItems } = useAdminStore();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', emoji: '🎁', auraCost: 100, stock: -1 });

  useEffect(() => { fetchStoreItems(); }, []);

  const handleSave = async () => {
    if (modal === 'new') {
      await api.post('/store/items', form);
    } else {
      await api.put(`/store/items/${modal}`, form);
    }
    fetchStoreItems();
    setModal(null);
    setForm({ name: '', description: '', emoji: '🎁', auraCost: 100, stock: -1 });
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', emoji: item.emoji || '🎁', auraCost: item.auraCost, stock: item.stock });
    setModal(item._id);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) { await api.delete(`/store/items/${id}`); fetchStoreItems(); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Aura Store</div>
          <div className="page-subtitle">{storeItems.length} items in store</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>+ Add Item</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16 }}>
        {storeItems.length === 0 ? (
          <div className="panel" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <p>No store items yet</p>
            </div>
          </div>
        ) : storeItems.map(item => (
          <div key={item._id} className="panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{item.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{item.description}</div>
            <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>⚡ {item.auraCost} Aura</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
              Stock: {item.stock === -1 ? '∞ Unlimited' : item.stock} · Claims: {item.totalClaims}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal === 'new' ? '+ New Store Item' : '✏️ Edit Item'}</div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <input className="form-input" value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Aura Cost</label>
                <input type="number" className="form-input" value={form.auraCost} onChange={e => setForm({...form, auraCost: +e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock (-1 = unlimited)</label>
                <input type="number" className="form-input" value={form.stock} onChange={e => setForm({...form, stock: +e.target.value})} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
