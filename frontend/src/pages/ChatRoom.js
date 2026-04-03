import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Plus, Minus, Search, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { detectContent } from '../utils/detector';
import '../styles/moderation.css';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, socket, updateAura } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [violationNotice, setViolationNotice] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinRoom', id);

    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('userTyping', ({ userId, auraName }) => {
      if (userId !== user.id) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, auraName }]);
      }
    });

    socket.on('userStoppedTyping', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    socket.on('messageStateUpdated', ({ messageId, state }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, state } : m));
    });

    return () => {
      socket.emit('leaveRoom', id);
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('messageStateUpdated');
    };
  }, [socket, id, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSend = async () => {
    if (!input.trim() || !socket) return;

    // Content Detection Check (Moderation)
    const analysis = await detectContent(input);
    if (!analysis.isSafe) {
      setViolationNotice(analysis.issues[0] || 'your message has been restricted as you are violating messaging rules');
      setTimeout(() => setViolationNotice(null), 5000);
      return;
    }

    // Aura Trigger Check
    if (input.includes('aura+++')) {
      updateAura(10);
    }

    const messageData = {
      roomId: id,
      sender: user.id,
      text: input,
      timestamp: new Date()
    };

    socket.emit('sendMessage', messageData);
    socket.emit('stopTyping', { roomId: id, userId: user.id });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket) return;

    socket.emit('typing', { roomId: id, userId: user.id, auraName: user.name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { roomId: id, userId: user.id });
    }, 2000);
  };

  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <button onClick={() => navigate('/rooms')} className="interactive" style={{ background: 'none', border: 'none', color: 'inherit', marginRight: '16px' }}><ArrowLeft /></button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px', margin: 0 }}>{id.toUpperCase()}</h2>
          <div style={{ fontSize: '0.6rem', opacity: 0.5, letterSpacing: '1px' }}>// CHANNEL_ACTIVE_SYNC</div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '8px', opacity: 0.3 }} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '6px 12px 6px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#fff', fontSize: '0.8rem', width: '150px' }}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="custom-scrollbar"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          background: 'rgba(0,0,0,0.05)'
        }}
      >
        {filteredMessages.map((msg, idx) => {
          const isMe = msg.sender?._id === user.id || msg.sender === user.id;
          return (
            <div key={msg._id || idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px', color: msg.sender?.auraColor || 'var(--accent-primary)' }}>
                  {isMe ? 'YOU' : (msg.sender?.auraName || 'ANONYMOUS')}
                </span>
                <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div 
                className="glass" 
                style={{ 
                  padding: '12px 18px', 
                  background: isMe ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', 
                  color: isMe ? '#000' : '#fff',
                  borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  fontWeight: '500',
                  boxShadow: isMe ? '0 4px 15px rgba(233, 30, 99, 0.2)' : 'none',
                  position: 'relative'
                }}
              >
                {msg.text}
                {isMe && (
                  <div style={{ position: 'absolute', bottom: '-18px', right: '4px', opacity: 0.5, fontSize: '10px' }}>
                    {msg.state === 'sent' ? '✓' : msg.state === 'delivered' ? '✓✓' : msg.state === 'read' ? <span style={{ color: '#4facfe' }}>✓✓</span> : '...'}
                  </div>
                )}
              </div>
              {!isMe && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button onClick={() => updateAura(5)} className="interactive aura-btn plus"><Plus size={10} /> 5</button>
                  <button onClick={() => updateAura(-2)} className="interactive aura-btn minus"><Minus size={10} /> 2</button>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicators */}
        {typingUsers.map(u => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={u.userId}
            style={{ fontSize: '0.7rem', opacity: 0.5, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div className="typing-dot" />
            {u.auraName} is manifesting code...
          </motion.div>
        ))}
      </div>

      {/* Violation Notice */}
      <AnimatePresence>
        {violationNotice && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ padding: '0 24px' }}
          >
            <div className="detection-warning critical" style={{ 
              marginBottom: '12px',
              background: 'rgba(212, 58, 96, 0.1)',
              border: '1px solid rgba(212, 58, 96, 0.2)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#d43a60',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <AlertTriangle size={16} />
              <span>{violationNotice}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            value={input}
            onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Speak into the void..."
            style={{ 
              width: '100%',
              background: 'rgba(255,255,255,0.03)', 
              border: violationNotice ? '1px solid #d43a60' : '1px solid var(--glass-border)', 
              padding: '14px 20px', 
              color: 'white', 
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
        <button 
          onClick={handleSend}
          className="interactive" 
          style={{ 
            background: 'var(--accent-primary)', 
            border: 'none', 
            color: '#000', 
            padding: '0 28px', 
            borderRadius: '12px',
            fontFamily: 'var(--font-bebas)',
            letterSpacing: '1px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          SEND <Send size={18} />
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
        .aura-btn { background: none; border: 1px solid currentColor; padding: 2px 10px; border-radius: 20px; font-size: 0.6rem; font-weight: 900; display: flex; alignItems: center; gap: 4px; transition: all 0.2s; }
        .aura-btn.plus { color: #5ec87a; }
        .aura-btn.plus:hover { background: rgba(94, 200, 122, 0.1); }
        .aura-btn.minus { color: #ff4d4d; }
        .aura-btn.minus:hover { background: rgba(255, 77, 77, 0.1); }
        .typing-dot { width: 6px; height: 6px; background: var(--accent-primary); borderRadius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ChatRoom;
