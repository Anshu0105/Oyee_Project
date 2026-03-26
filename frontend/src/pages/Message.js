import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Send, Search, MessageSquare } from 'lucide-react';

const Message = () => {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState(null);
  const [input, setInput] = useState('');

  const contacts = [
    { name: 'Crunchy Mango', badge: '⚡', relation: 'friend', aura: 672, lastMsg: 'yo the prof is insane ngl 😭' },
    { name: 'Fluffy Pancake', badge: '⭐', relation: 'friend', aura: 1247, lastMsg: 'study room on 3rd floor is free rn' },
    { name: 'Bitter Lychee', badge: '', relation: 'enemy', aura: 34, lastMsg: 'AuraMinus--- take that 😈' },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '320px 1fr', 
      height: 'calc(100vh - 110px)', 
      margin: '0 12px 12px',
    }} className="glass">
      {/* Sidebar */}
      <div style={{ borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', marginBottom: '16px' }}>MESSAGES</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              placeholder="Search identities..." 
              style={{ width: '100%', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', padding: '8px 8px 8px 36px', borderRadius: '4px', color: 'white' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.map(contact => (
            <div 
              key={contact.name}
              onClick={() => setSelectedUser(contact)}
              className="interactive"
              style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid var(--glass-border)',
                background: selectedUser?.name === contact.name ? 'rgba(255,255,255,0.05)' : 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', gap: '4px' }}>{contact.name} {contact.badge}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>2m ago</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {contact.lastMsg}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-chat)' }}>
        {selectedUser ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {selectedUser.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{selectedUser.name} {selectedUser.badge}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{selectedUser.aura} aura • {selectedUser.relation}</div>
              </div>
            </div>
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                <div className="glass" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)' }}>
                  {selectedUser.lastMsg}
                </div>
              </div>
              <div style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>
                <div className="glass" style={{ padding: '12px 16px', background: 'var(--accent-primary)' }}>
                  lmao keep it anonymous
                </div>
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '4px', color: 'white' }}
              />
              <button className="interactive" style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '0 20px', borderRadius: '4px' }}>
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={64} style={{ marginBottom: '16px' }} />
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '4px' }}>SELECT THE VOID</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
