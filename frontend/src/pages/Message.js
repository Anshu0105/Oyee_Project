import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { MessageSquare, ChevronLeft } from 'lucide-react';

const Message = () => {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState(null);
  const [input, setInput] = useState('');

  const contacts = [
    { name: 'Crunchy Mango', badgeLeft: '⚡', badgeRight: '⚡', relation: 'FRIEND', aura: 672, lastMsg: 'yo the lecture was absolutely insane ngl', time: '2m ago', unread: true },
    { name: 'Fluffy Pancake', badgeLeft: '⭐', badgeRight: '⭐', relation: 'FRIEND', aura: 1247, lastMsg: 'study room on 3rd floor is free rn', time: '18m ago', unread: false },
    { name: 'Bitter Lychee', badgeLeft: '💀', badgeRight: '', relation: 'ENEMY', aura: 34, lastMsg: 'AuraMinus--- take that 👿', time: '1h ago', unread: false },
    { name: 'Spicy Ramen', badgeLeft: '🍜', badgeRight: '', relation: 'FRIEND', aura: 198, lastMsg: 'did you see that in the wifi room lmao', time: '3h ago', unread: false },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(320px, 400px) 1fr', 
      height: 'calc(100vh - 88px)', 
      margin: '0 24px 24px',
      background: '#ffffff',
      color: '#111111',
      border: '1px solid #e0e0e0',
      fontFamily: 'var(--font-inter)'
    }}>
      {/* Sidebar (Inbox) */}
      <div style={{ borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #e0e0e0' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '2px', lineHeight: 1, marginBottom: '4px' }}>
            MESSAGES
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#888888', letterSpacing: '1px', marginBottom: '16px' }}>
            {'//'} anonymous direct conversations
          </p>
          <div style={{ width: '32px', height: '3px', background: '#8c1a30', borderRadius: '2px', marginBottom: '24px' }} />
          
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#666666', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px' }}>
            INBOX - ALL IDENTITIES ANONYMOUS
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.map(contact => {
            const isEnemy = contact.relation === 'ENEMY';
            return (
              <div 
                key={contact.name}
                onClick={() => setSelectedUser(contact)}
                style={{ 
                  padding: '20px 24px', 
                  borderBottom: '1px solid #eeeeee',
                  background: selectedUser?.name === contact.name ? '#f5f5f5' : (isEnemy ? '#fff5f7' : 'transparent'),
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{contact.badgeLeft}</span>
                    <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.3rem', color: isEnemy ? '#8c1a30' : '#111' }}>
                      {contact.name}
                    </span>
                    <span style={{ fontSize: '1.2rem' }}>{contact.badgeRight}</span>
                    
                    {/* Relation Badge */}
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: isEnemy ? '#8c1a30' : '#5cb85c',
                      letterSpacing: '1px',
                      marginLeft: '4px'
                    }}>
                      {contact.relation}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#666666' }}>
                    {contact.lastMsg}
                  </div>
                </div>

                {/* Right side data */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#999999', marginTop: '4px' }}>
                  {contact.time}
                  {contact.unread && <div style={{ width: '8px', height: '8px', background: '#8c1a30', borderRadius: '50%' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area (Chat Bag) */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid #e0e0e0', 
              background: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setSelectedUser(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#8c1a30',
                    background: 'transparent',
                    border: '1px solid #eeeeee',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    letterSpacing: '1px'
                  }}
                >
                  <ChevronLeft size={14} /> BACK
                </button>
                
                <div style={{ width: '40px', height: '40px', background: '#8c1a30', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-bebas)', fontSize: '1.5rem' }}>
                  {selectedUser.name[0]}
                </div>
                
                <div>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', color: '#111111', letterSpacing: '1px', lineHeight: 1, marginBottom: '4px' }}>
                    {selectedUser.name.toUpperCase()} {selectedUser.badgeRight || selectedUser.badgeLeft}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888888', letterSpacing: '0.5px' }}>
                    {selectedUser.aura} aura - anonymous identity
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: selectedUser.relation === 'ENEMY' ? '#8c1a30' : '#5cb85c',
                border: `1px solid ${selectedUser.relation === 'ENEMY' ? '#8c1a30' : '#5cb85c'}`,
                padding: '4px 12px',
                borderRadius: '4px',
                letterSpacing: '1px'
              }}>
                {selectedUser.relation}
              </div>
            </div>
            
            {/* Chat History ("Chat Bag") */}
            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
              
              {/* Left Received Message */}
              <div style={{ alignSelf: 'flex-start', maxWidth: '60%' }}>
                <div style={{ 
                  padding: '16px 20px', 
                  background: '#ffffff', 
                  border: '1px solid #e8e8e8',
                  color: '#333333',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  borderRadius: '0 12px 12px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  hey found you in the room earlier 👀
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#aaaaaa', marginTop: '6px', marginLeft: '4px' }}>
                  2m ago
                </div>
              </div>

              {/* Right Sent Message */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '60%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  border: '2px solid #111111', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '8px',
                  fontSize: '1.2rem'
                }}>
                  {user.mood === 'happy' ? '☻' : '☹'}
                </div>
                <div style={{ 
                  padding: '16px 20px', 
                  background: '#fcf0f2', 
                  border: '1px solid #f2d5da',
                  color: '#8c1a30',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  borderRadius: '12px 0 12px 12px',
                }}>
                  lol yeah that was wild
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#aaaaaa', marginTop: '6px', marginRight: '4px' }}>
                  1m ago
                </div>
              </div>

            </div>
            
            {/* Input Bottom */}
            <div style={{ padding: '24px', background: '#ffffff', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '16px' }}>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="type anonymously... no links"
                style={{ 
                  flex: 1, 
                  background: '#f9f9f9', 
                  border: '1px solid #dddddd', 
                  padding: '16px 20px', 
                  color: '#111111',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#8c1a30'}
                onBlur={e => e.target.style.borderColor = '#dddddd'}
              />
              <button 
                className="interactive" 
                style={{ 
                  background: '#8c1a30', 
                  border: 'none', 
                  color: '#ffffff', 
                  padding: '0 32px', 
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#c42850'}
                onMouseLeave={e => e.currentTarget.style.background = '#8c1a30'}
              >
                SEND
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15, color: '#111111' }}>
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={80} style={{ marginBottom: '24px' }} />
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '4px' }}>SELECT THE VOID</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
