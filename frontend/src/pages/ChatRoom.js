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

    // Canonical Room ID logic: use roomData if available, fallback to raw id
    const canonicalId = roomData?.room_code || id;

    socketRef.current = io(BACKEND_URL);
    socketRef.current.emit('joinRoom', canonicalId);

    socketRef.current.on('receiveMessage', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socketRef.current.on('auraUpdate', (payload) => {
      // Global aura update sync can be handled here if needed in specific components
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, token, roomData]); // Re-join if roomData manifest arrives

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
    // Always transmit on the canonical frequency
    const canonicalId = roomData?.room_code || id;

    const messagePayload = {
      roomId: canonicalId,
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
      height: 'calc(100vh - 80px)', // Consistent with Message.js
      background: 'var(--bg-main)',
      overflow: 'hidden',
      color: 'var(--text-main)'
    }}>
      {/* Header (Fixed) */}
      <div style={{ 
        padding: '14px 24px', 
        borderBottom: '1px solid var(--border-main)', 
        display: 'flex', 
        alignItems: 'center',
        background: 'var(--bg-panel)',
        zIndex: 10,
        flexShrink: 0
      }}>
        <button onClick={() => navigate('/rooms')} className="interactive" style={{ background: 'none', border: 'none', color: 'inherit', marginRight: '16px' }}><ArrowLeft /></button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px', margin: 0 }}>{roomInfo.name.toUpperCase()}</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.5, margin: '2px 0 0', letterSpacing: '0.5px' }}>{roomInfo.desc}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {roomData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-main)' }}>
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>ROOM ID:</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>{roomData.room_code || id}</span>
                <button 
                    onClick={copyToClipboard}
                    style={{ background: 'none', border: 'none', color: copied ? '#48bb78' : 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
          )}
          {!roomData && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>// Connected</span>}
        </div>
      </div>

      {/* Messages (Scrollable) */}
      <div 
        className="scroll-container"
        style={{ 
          flex: 1, 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          background: 'var(--bg-main)'
        }}
      >
        {messages.length === 0 && (
           <div style={{ textAlign: 'center', opacity: 0.2, marginTop: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              // THE VOID IS QUIET. START A CONVERSATION.
           </div>
        )}
        {messages.map((msg, i) => {
          const currentUserId = String(user?.id || user?._id || '');
          const msgSenderId = String(msg.senderId?._id || msg.senderId || '');
          // Only mark as mine if IDs are non-empty and match exactly
          const isMe = currentUserId.length > 0 && msgSenderId.length > 0 && msgSenderId === currentUserId;
          
          const timeFormat = msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
          const targetId = msgSenderId;
          const displayName = isMe ? user.auraName : msg.user;
          const displayEmoji = isMe ? user.avatarEmoji : (msg.avatarEmoji || '👤');

          return (
            <div key={msg._id || msg.id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '12px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
              
              <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: isMe ? '1px solid var(--accent-primary)' : '1px solid var(--border-main)',
                  fontSize: '1.2rem'
              }}>
                {displayEmoji}
              </div>

              <div style={{ textAlign: isMe ? 'right' : 'left' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '4px' }}>
                    <span style={{ color: isMe ? 'var(--accent-primary)' : '#fff', fontWeight: '800' }}>{displayName}</span> • {timeFormat}
                </div>
                <div className="glass" style={{ 
                    padding: '12px 16px', background: isMe ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255,255,255,0.02)', 
                    color: 'white', borderRadius: isMe ? '16px 0 16px 16px' : '0 16px 16px 16px', 
                    border: isMe ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    boxShadow: isMe ? '0 0 15px var(--glass-border)' : 'none'
                }}>
                    {msg.text}
                </div>
                
                {!isMe && targetId && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <button 
                        disabled={user.auraVotesGiven?.some(v => v.userId === targetId)}
                        onClick={() => handleAction((t) => updateAura(t, 'up'), targetId, '+7 Aura Manifested')}
                        className="interactive hover-lift" 
                        style={{ 
                        background: 'rgba(57, 255, 20, 0.05)', border: '1px solid #39FF14', color: '#39FF14', 
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', 
                        alignItems: 'center', gap: '4px', opacity: (user.auraVotesGiven?.some(v => v.userId === targetId)) ? 0.3 : 1
                        }}
                    >
                        +7 Aura
                    </button>
                    <button 
                        disabled={user.auraVotesGiven?.some(v => v.userId === targetId)}
                        onClick={() => handleAction((t) => updateAura(t, 'down'), targetId, '-3 Aura Manifested')}
                        className="interactive hover-lift" 
                        style={{ 
                        background: 'rgba(255, 77, 77, 0.05)', border: '1px solid #ff4d4d', color: '#ff4d4d', 
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', 
                        alignItems: 'center', gap: '4px', opacity: (user.auraVotesGiven?.some(v => v.userId === targetId)) ? 0.3 : 1
                        }}
                    >
                        -3 Aura
                    </button>
                    <button 
                        disabled={user.friends?.includes(targetId) || user.enemies?.includes(targetId)}
                        onClick={() => handleAction(addFriend, targetId, 'Frequency: Friend')}
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

      {/* Action Notice */}
      {violationNotice && (
        <div style={{ padding: '0 24px', flexShrink: 0, position: 'absolute', bottom: '100px', left: '24px', right: '24px', zIndex: 100 }}>
          <div className="detection-warning toast" style={{ 
            background: violationNotice.startsWith('Success') ? 'rgba(94, 200, 122, 0.9)' : 'rgba(212, 58, 96, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${violationNotice.startsWith('Success') ? '#5ec87a' : '#d43a60'}`,
            borderRadius: '12px',
            padding: '16px 24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <AlertTriangle size={20} />
            <span><strong>System:</strong> {violationNotice}</span>
          </div>
        </div>
      )}

      {/* Input (Fixed Bottom) */}
      <div style={{ padding: '24px 32px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-main)', flexShrink: 0 }}>
        <div style={{ 
          display: 'flex', gap: '16px', alignItems: 'center', 
          background: 'rgba(255,255,255,0.03)', padding: '8px 8px 8px 16px',
          borderRadius: '16px', border: '1px solid var(--border-main)'
        }}>
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
              background: 'transparent', 
              border: 'none', 
              padding: '12px 10px', 
              color: 'white', 
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleSend}
            className="interactive" 
            style={{ 
              background: 'var(--accent-primary)', 
              border: 'none', 
              color: 'white', 
              padding: '14px 34px', 
              borderRadius: '12px', 
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 0 20px var(--glass-border)'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
