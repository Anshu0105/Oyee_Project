import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Info, Users, MapPin, Wifi, Globe } from 'lucide-react';

const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Open',
    maxUsers: 50
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onCreate(formData);
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px', color: '#fff', margin: 0 }}>CREATE ROOM</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '8px' }}>ROOM NAME</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Late Night Vibes"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '8px' }}>DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's happening in this room?"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '8px' }}>ROOM TYPE</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="GPS-based">GPS-based</option>
                    <option value="Wifi">Wifi</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '8px' }}>MAX USERS</label>
                  <select
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value={50}>50 Users</option>
                    <option value={100}>100 Users</option>
                    <option value={200}>200 Users</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.name}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  opacity: (isLoading || !formData.name) ? 0.6 : 1
                }}
              >
                {isLoading ? 'Creating...' : 'CREATE ROOM'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateRoomModal;
