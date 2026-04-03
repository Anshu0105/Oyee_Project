import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Plus, Minus, UserPlus, AlertTriangle } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { useUser } from '../context/UserContext';
import { detectContent } from '../utils/detector';
import '../styles/moderation.css';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, socket, updateAura } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [violationNotice, setViolationNotice] = useState(null);
  const [room, setRoom] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const scrollRef = useRef();

  // Socket Connection & Real-time Messages
  useEffect(() => {
    if (socket && id) {
      socket.emit('joinRoom', id);

      const handleMessage = (msg) => {
        if (msg.roomId === id || (id === 'global' && !msg.roomId)) {
          setMessages(prev => [...prev, msg]);
        }
      };

      socket.on('receiveMessage', handleMessage);
      return () => {
        socket.off('receiveMessage', handleMessage);
        socket.emit('leaveRoom', id);
      };
    }
  }, [id, socket]);

  // Fetch Room & Initial Data
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
  }, [id, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    // Detect @ for tagging
    const lastAtPos = val.lastIndexOf('@');
    if (lastAtPos !== -1 && (lastAtPos === 0 || val[lastAtPos - 1] === ' ')) {
      const query = val.slice(lastAtPos + 1).split(' ')[0];
      setMentionFilter(query);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (username) => {
    const lastAtPos = input.lastIndexOf('@');
    const before = input.slice(0, lastAtPos);
    const after = input.slice(lastAtPos + 1).split(' ').slice(1).join(' ');
    setInput(`${before}@${username} ${after}`);
    setShowMentions(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const analysis = await detectContent(input);
    if (!analysis.isSafe) {
      setViolationNotice(analysis.issues[0] || 'Inappropriate content detected.');
      setTimeout(() => setViolationNotice(null), 5000);
      return;
    }

    const messageData = {
      roomId: id,
      userId: user._id,
      username: user.username,
      auraName: user.auraName,
      content: input,
      createdAt: new Date()
    };

    socket.emit('sendMessage', messageData);
    setInput('');
    setShowMentions(false);
  };

  const filteredMembers = room?.members?.filter(m => 
    m.username.toLowerCase().includes(mentionFilter.toLowerCase()) && 
    m.username !== user.username
  ) || [];

  const renderContent = (content) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <motion.span 
            key={i} 
            animate={{ textShadow: ['0 0 0px var(--accent-primary)', '0 0 10px var(--accent-primary)', '0 0 0px var(--accent-primary)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
          >
            {part}
          </motion.span>
        );
      }
      return part;
    });
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
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate('/rooms')} className="interactive" style={{ background: 'none', border: 'none', color: 'inherit', marginRight: '16px' }}><ArrowLeft /></button>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', letterSpacing: '2px' }}>
          {room ? room.name.toUpperCase() : id.toUpperCase()}
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>// {room?.members?.length || 1} online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-chat)' }}>
        {messages.map((msg, idx) => (
          <div key={msg._id || idx} style={{ alignSelf: msg.userId === user?._id ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '4px', textAlign: msg.userId === user?._id ? 'right' : 'left' }}>
              {msg.auraName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="glass" style={{ padding: '12px 16px', background: msg.userId === user?._id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: 'white' }}>
              {renderContent(msg.content)}
            </div>
          </div>
        ))}
      </div>

      {/* Mentions Dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="glass" style={{
          position: 'absolute',
          bottom: '100px',
          left: '24px',
          width: '200px',
          maxHeight: '150px',
          overflowY: 'auto',
          background: 'var(--bg-panel)',
          zIndex: 100,
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          padding: '4px'
        }}>
          {filteredMembers.map(m => (
            <div 
              key={m._id} 
              onClick={() => selectMention(m.username)}
              className="interactive"
              style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              @{m.username}
            </div>
          ))}
        </div>
      )}

      {/* Input Section */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px', position: 'relative' }}>
        <input 
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type @ to tag someone..."
          style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px 20px', color: 'white', borderRadius: '8px' }}
        />
        <button onClick={handleSend} className="interactive" style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '0 24px', borderRadius: '8px' }}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;

