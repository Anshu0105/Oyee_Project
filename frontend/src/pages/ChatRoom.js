import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Plus, Minus, UserPlus, AlertTriangle, Copy, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { detectContent } from '../utils/detector';
import { safeFetch } from '../config';
import io from 'socket.io-client';
import '../styles/moderation.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://oyeee-backend.onrender.com';

// Helper to get a friendly room name and description from the raw room ID
const getRoomInfo = (roomId) => {
  if (roomId.startsWith('wifi_')) {
    return { name: 'WiFi Room', desc: 'connected via common IP gateway...' };
  }
  if (roomId.startsWith('uni_')) {
    return { name: 'University Room', desc: 'verified institutional network...' };
  }
  if (roomId.startsWith('nearby_')) {
    return { name: 'Nearby Room', desc: 'connected via GPS proximity...' };
  }
  return { name: roomId.toUpperCase(), desc: 'live anonymous chat...' };
};

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, updateAura, addFriend, addEnemy } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [violationNotice, setViolationNotice] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchInfo = async () => {
      if (id && id.length === 10 && !id.includes('_')) {
          try {
              const data = await safeFetch(`/api/rooms/info/${id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              setRoomData(data);
          } catch(err) { console.error('Room info fetch failed', err); }
      }
    };
    if (token) fetchInfo();
  }, [id, token]);

  const roomInfo = roomData ? {
    name: roomData.name,
    desc: roomData.description.split(' ').slice(0, 4).join(' ') + (roomData.description.split(' ').length > 4 ? '...' : '')
  } : getRoomInfo(id);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(BACKEND_URL);
    socketRef.current.emit('joinRoom', id);

    socketRef.current.on('receiveMessage', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socketRef.current.on('auraUpdate', (payload) => {
      // Global aura update sync can be handled here if needed in specific components
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, token]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleAction = async (actionFn, targetId, successMessage) => {
    try {
      await actionFn(targetId);
      setViolationNotice(`Success: ${successMessage}`);
      setTimeout(() => setViolationNotice(null), 3000);
    } catch (err) {
      setViolationNotice(err.message || 'Action failed');
      setTimeout(() => setViolationNotice(null), 3000);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Content Detection Check
    const analysis = await detectContent(input);
    
    if (!analysis.isSafe) {
      setViolationNotice(analysis.issues[0] || 'your message has been restricted as you are violating messaging rules');
      setTimeout(() => setViolationNotice(null), 5000);
      return; 
    }

    const senderName = user.name || 'Anonymous';

    const messagePayload = {
      roomId: id,
      text: input,
      user: senderName,
      senderId: user.id || user._id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    socketRef.current.emit('sendMessage', messagePayload);
    setInput('');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 110px)', 
      margin: '0 12px 12px',
      position: 'relative',
      overflow: 'hidden'
    }} className="glass">
      {/* Header */}
      <div style={{ 
        padding: '14px 24px', 
        borderBottom: '1px solid var(--glass-border)', 
        display: 'flex', 
        alignItems: 'center',
        background: 'rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        <button onClick={() => navigate('/rooms')} className="interactive" style={{ background: 'none', border: 'none', color: 'inherit', marginRight: '16px' }}><ArrowLeft /></button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px', margin: 0 }}>{roomInfo.name.toUpperCase()}</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.5, margin: '2px 0 0', letterSpacing: '0.5px' }}>{roomInfo.desc}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {roomData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>ROOM ID:</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>{id}</span>
                <button 
                    onClick={copyToClipboard}
                    style={{ background: 'none', border: 'none', color: copied ? '#48bb78' : '#FF0055', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
          )}
          {!roomData && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>// Connected</span>}
        </div>
      </div>

      {/* Messages */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          background: 'var(--bg-chat)',
          minHeight: 0
        }}
      >
        {messages.length === 0 && (
           <div style={{ textAlign: 'center', opacity: 0.2, marginTop: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              // THE VOID IS QUIET. START A CONVERSATION.
           </div>
        )}
        {messages.map((msg, i) => {
          const isMe = (msg.senderId && (msg.senderId === user.id || msg.senderId._id === user.id)) || msg.user === user.auraName || msg.user === user.name;
          const timeFormat = msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
          const targetId = msg.senderId?._id || msg.senderId;
          const displayName = isMe ? user.auraName : msg.user;
          const displayEmoji = isMe ? user.avatarEmoji : (msg.avatarEmoji || '👤');

          return (
            <div key={msg._id || msg.id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '12px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
              
              <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: isMe ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                  fontSize: '1.2rem'
              }}>
                {displayEmoji}
              </div>

              <div style={{ textAlign: isMe ? 'right' : 'left' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '4px' }}>
                    <span style={{ color: isMe ? 'var(--accent-primary)' : '#fff', fontWeight: '800' }}>{displayName}</span> • {timeFormat}
                </div>
                <div className="glass" style={{ 
                    padding: '12px 16px', background: isMe ? 'rgba(233, 30, 99, 0.15)' : 'rgba(255,255,255,0.05)', 
                    color: 'white', borderRadius: isMe ? '16px 0 16px 16px' : '0 16px 16px 16px', 
                    border: isMe ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    boxShadow: isMe ? '0 0 15px rgba(255, 0, 85, 0.1)' : 'none'
                }}>
                    {msg.text}
                </div>
                
                {!isMe && targetId && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <button 
                        disabled={user.auraVotesGiven.some(v => v.userId === targetId)}
                        onClick={() => handleAction((t) => updateAura(t, 'up'), targetId, '+1 Aura given')}
                        className="interactive hover-lift" 
                        style={{ 
                        background: 'rgba(57, 255, 20, 0.05)', border: '1px solid #39FF14', color: '#39FF14', 
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', 
                        alignItems: 'center', gap: '4px', opacity: user.auraVotesGiven.some(v => v.userId === targetId) ? 0.3 : 1
                        }}
                    >
                        + Aura
                    </button>
                    <button 
                        disabled={user.auraVotesGiven.some(v => v.userId === targetId)}
                        onClick={() => handleAction((t) => updateAura(t, 'down'), targetId, '-1 Aura given')}
                        className="interactive hover-lift" 
                        style={{ 
                        background: 'rgba(255, 77, 77, 0.05)', border: '1px solid #ff4d4d', color: '#ff4d4d', 
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', 
                        alignItems: 'center', gap: '4px', opacity: user.auraVotesGiven.some(v => v.userId === targetId) ? 0.3 : 1
                        }}
                    >
                        - Aura
                    </button>
                    <button 
                        disabled={user.friends?.includes(targetId) || user.enemies?.includes(targetId)}
                        onClick={() => handleAction(addFriend, targetId, 'Added as friend')}
                        className="interactive hover-lift" 
                        style={{ 
                            background: 'rgba(0, 212, 255, 0.05)', border: '1px solid #00D4FF', color: '#00D4FF',
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem',
                            opacity: (user.friends?.includes(targetId) || user.enemies?.includes(targetId)) ? 0.3 : 1
                        }}
                    >
                        Add Friend
                    </button>
                    <button 
                        disabled={user.enemies?.includes(targetId) || user.friends?.includes(targetId)}
                        onClick={() => handleAction(addEnemy, targetId, 'Added as enemy')}
                        className="interactive hover-lift" 
                        style={{ 
                            background: 'rgba(255, 215, 0, 0.05)', border: '1px solid #FFD700', color: '#FFD700',
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem',
                            opacity: (user.enemies?.includes(targetId) || user.friends?.includes(targetId)) ? 0.3 : 1
                        }}
                    >
                        Add Enemy
                    </button>
                    </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Action Notice (System Message / Toast) */}
      {violationNotice && (
        <div style={{ padding: '0 24px', flexShrink: 0 }}>
          <div className="detection-warning toast" style={{ 
            marginBottom: '12px',
            background: violationNotice.startsWith('Success') ? 'rgba(94, 200, 122, 0.15)' : 'rgba(212, 58, 96, 0.15)',
            border: `1px solid ${violationNotice.startsWith('Success') ? '#5ec87a' : '#d43a60'}`,
            borderRadius: '8px',
            padding: '12px 20px',
            color: violationNotice.startsWith('Success') ? '#5ec87a' : '#d43a60',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <AlertTriangle size={18} />
            <span><strong>System:</strong> {violationNotice}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px', flexShrink: 0 }}>
        <input 
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (violationNotice && !violationNotice.startsWith('Success')) setViolationNotice(null);
          }}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Speak into the void..."
          style={{ 
            flex: 1, 
            background: 'rgba(0,0,0,0.2)', 
            border: (violationNotice && !violationNotice.startsWith('Success')) ? '1px solid #d43a60' : '1px solid var(--glass-border)', 
            padding: '12px 20px', 
            color: 'white', 
            borderRadius: '8px',
            transition: 'border-color 0.3s ease'
          }}
        />
        <button 
          onClick={handleSend}
          className="interactive" 
          style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '0 24px', borderRadius: '12px', cursor: 'pointer' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
