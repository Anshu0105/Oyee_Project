import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Plus, Minus, UserPlus } from 'lucide-react';
import { useUser } from '../context/UserContext';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateAura, addFriend, addEnemy } = useUser();
  const [messages, setMessages] = useState([
    { id: 1, user: 'Crunchy Mango', text: 'anyone else cramming for midterms rn or just me 😭', time: '12:01 PM' },
    { id: 2, user: 'Spicy Ramen', text: 'the wifi in the library is absolutely criminal today', time: '12:02 PM' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), user: 'Anonymous (You)', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setInput('');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 110px)', 
      margin: '0 12px 12px',
    }} className="glass">
      {/* Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid var(--glass-border)', 
        display: 'flex', 
        alignItems: 'center',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <button onClick={() => navigate('/rooms')} className="interactive" style={{ background: 'none', border: 'none', color: 'inherit', marginRight: '16px' }}><ArrowLeft /></button>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px' }}>{id.toUpperCase()} ROOM</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>// 42 users</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          background: 'var(--bg-chat)'
        }}
      >
        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.user.includes('You') ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '4px', textAlign: msg.user.includes('You') ? 'right' : 'left' }}>{msg.user} • {msg.time}</div>
            <div className="glass" style={{ padding: '12px 16px', background: msg.user.includes('You') ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: 'white' }}>
              {msg.text}
            </div>
            {!msg.user.includes('You') && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  onClick={() => updateAura(7)}
                  className="interactive" 
                  style={{ background: 'none', border: '1px solid #5ec87a', color: '#5ec87a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Aura
                </button>
                <button 
                  onClick={() => updateAura(-3)}
                  className="interactive" 
                  style={{ background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Minus size={12} /> Aura
                </button>
                <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
                   <button onClick={() => addFriend(msg.user)} className="interactive" style={{ fontSize: '0.6rem', opacity: 0.7 }}>Add Friend</button>
                   <button onClick={() => addEnemy(msg.user)} className="interactive" style={{ fontSize: '0.6rem', opacity: 0.7 }}>Add Enemy</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Speak into the void..."
          style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px 20px', color: 'white', borderRadius: '8px' }}
        />
        <button 
          onClick={handleSend}
          className="interactive" 
          style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '0 24px', borderRadius: '8px' }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
