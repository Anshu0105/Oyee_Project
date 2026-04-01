import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Plus, Minus, UserPlus, AlertTriangle } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { useUser } from '../context/UserContext';
import { detectContent } from '../utils/detector';
import '../styles/moderation.css';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateAura, addFriend, addEnemy } = useUser();
  const [messages, setMessages] = useState([
    { id: 1, user: 'Crunchy Mango', text: 'anyone else cramming for midterms rn or just me 😭', time: '12:01 PM' },
    { id: 2, user: 'Spicy Ramen', text: 'the wifi in the library is absolutely criminal today', time: '12:02 PM' }
  ]);
  const [input, setInput] = useState('');
  const [violationNotice, setViolationNotice] = useState(null);
  const [room, setRoom] = useState(null);
  const scrollRef = useRef();

  const { token } = useUser();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rooms/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setRoom(data.room);
      } catch (err) {
        console.error("Failed to fetch room:", err);
      }
    };
    fetchRoom();
  }, [id, token, BACKEND_URL]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Content Detection Check
    const analysis = await detectContent(input);
    
    if (!analysis.isSafe) {
      setViolationNotice(analysis.issues[0] || 'your message has been restricted as you are violating messeaging rules');
      
      // Auto-hide notice after 5 seconds
      setTimeout(() => {
        setViolationNotice(null);
      }, 5000);
      
      return; // Block the message
    }

    // If safe, proceed with sending
    setMessages([...messages, { 
      id: Date.now(), 
      user: 'Anonymous (You)', 
      text: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    
    setInput('');
    setViolationNotice(null);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 110px)', 
      margin: '0 12px 12px',
      position: 'relative'
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
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px' }}>
          {room ? room.name.toUpperCase() : id.toUpperCase()}
        </h2>
        
        {room?.roomCode && (
          <div style={{
            marginLeft: '16px',
            padding: '4px 12px',
            background: 'var(--accent-primary)',
            borderRadius: '4px',
            color: 'black',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            boxShadow: '0 0 10px var(--accent-primary)'
          }}>
            CODE: {room.roomCode}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>// {room?.members?.length || 1} online</span>
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

      {/* Violation Notice (System Message) */}
      {violationNotice && (
        <div style={{ padding: '0 24px' }}>
          <div className="detection-warning critical" style={{ 
            marginBottom: '12px',
            background: 'rgba(212, 58, 96, 0.15)',
            border: '1px solid rgba(212, 58, 96, 0.3)',
            borderRadius: '8px',
            padding: '12px 20px',
            color: '#d43a60',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <AlertTriangle size={18} />
            <span><strong>System Notice:</strong> {violationNotice.toLowerCase()}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
        <input 
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (violationNotice) setViolationNotice(null);
          }}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Speak into the void..."
          style={{ 
            flex: 1, 
            background: 'rgba(0,0,0,0.2)', 
            border: violationNotice ? '1px solid #d43a60' : '1px solid var(--glass-border)', 
            padding: '12px 20px', 
            color: 'white', 
            borderRadius: '8px',
            transition: 'border-color 0.3s ease'
          }}
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

