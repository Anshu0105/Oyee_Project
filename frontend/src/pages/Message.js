import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { MessageSquare, ChevronLeft, Paperclip, Loader2, Search, Send, MapPin, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../components/UI/MessageBubble';

const BACKEND_URL = window.location.hostname === 'localhost' 
  ? (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000')
  : 'https://oyeee-backend.onrender.com';

const Message = () => {
  const { user, token, socket } = useUser();
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [typingPeer, setTypingPeer] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchAvailableUsers();
  }, [token]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const peers = [user.id, selectedUser._id].sort();
    const channel = `dm_${peers[0]}_${peers[1]}`;
    socket.emit('joinRoom', channel);

    socket.on('receiveDirectMessage', (payload) => {
      setMessages(prev => [...prev, payload]);
      // Mark as read if we are looking at it
      if (payload.senderId !== user.id) {
        socket.emit('updateMessageState', { messageId: payload._id, state: 'read', roomId: channel });
      }
    });

    socket.on('userTyping', ({ userId }) => {
      if (userId === selectedUser._id) setTypingPeer(true);
    });

    socket.on('userStoppedTyping', ({ userId }) => {
      if (userId === selectedUser._id) setTypingPeer(false);
    });

    socket.on('messageStateUpdated', ({ messageId, state }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, state } : m));
    });

    fetchChatHistory(selectedUser._id);

    return () => {
      socket.emit('leaveRoom', channel);
      socket.off('receiveDirectMessage');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('messageStateUpdated');
    };
  }, [socket, selectedUser, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingPeer]);

  const fetchAvailableUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dm/available-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data);
    } catch(err) {
      console.error(err);
    }
  };

  const fetchChatHistory = async (peerId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dm/history/${peerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSendText = () => {
    if (!input.trim() || !selectedUser || !socket) return;
    
    const payload = {
      senderId: user.id,
      receiverId: selectedUser._id,
      content: input,
      type: 'text'
    };

    socket.emit('sendDirectMessage', payload);
    handleStopTyping();
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket || !selectedUser) return;

    const peers = [user.id, selectedUser._id].sort();
    const channel = `dm_${peers[0]}_${peers[1]}`;
    socket.emit('typing', { roomId: channel, userId: user.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(handleStopTyping, 2000);
  };

  const handleStopTyping = () => {
    if (!socket || !selectedUser) return;
    const peers = [user.id, selectedUser._id].sort();
    const channel = `dm_${peers[0]}_${peers[1]}`;
    socket.emit('stopTyping', { roomId: channel, userId: user.id });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedUser) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("File exceeds 25MB limit");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/dm/upload-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const payload = {
        senderId: user.id,
        receiverId: selectedUser._id,
        type: 'file',
        attachment: {
          url: data.fileUrl,
          name: data.fileName,
          fileType: file.type,
          size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        }
      };

      socket.emit('sendDirectMessage', payload);
    } catch(err) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.auraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '350px 1fr', 
      height: 'calc(100vh - 100px)', 
      margin: '0 20px 20px',
      background: '#0a0a0a',
      color: '#fff',
      border: '1px solid #222',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }}>
      {/* Sidebar */}
      <div style={{ borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', background: '#0f0f0f' }}>
        <div style={{ padding: '32px 24px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '4px', margin: 0 }}>VOID LINKS</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.4, marginTop: '8px' }}>// ENCRYPTED P2P CHANNELS</p>
          
          <div style={{ position: 'relative', marginTop: '24px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.3 }} />
            <input 
              type="text" 
              placeholder="Search identities..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
          {filteredContacts.map(contact => (
            <div 
              key={contact._id}
              onClick={() => setSelectedUser(contact)}
              style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid #1a1a1a',
                background: selectedUser?._id === contact._id ? 'rgba(233, 30, 99, 0.05)' : 'transparent',
                borderLeft: selectedUser?._id === contact._id ? '4px solid var(--accent-primary)' : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ fontSize: '1.8rem', width: '50px', height: '50px', background: '#1a1a1a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' }}>
                {contact.avatarEmoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px' }}>{contact.auraName}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.4, fontFamily: 'var(--font-mono)' }}>@{contact.username}</div>
              </div>
              {contact.isOnline && (
                <div style={{ width: '8px', height: '8px', background: '#48bb78', borderRadius: '50%', boxShadow: '0 0 10px #48bb78' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
        {selectedUser ? (
          <>
            <div style={{ padding: '20px 32px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '2rem', width: '50px', height: '50px', background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedUser.avatarEmoji}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', margin: 0, letterSpacing: '2px' }}>{selectedUser.auraName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', opacity: 0.5 }}>
                    <ShieldCheck size={12} color="var(--accent-primary)" /> E2E ENCRYPTED • {selectedUser.isOnline ? 'ACTIVE' : 'IDLE'}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{selectedUser.aura} AURA</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.4, letterSpacing: '1px' }}>REPUTATION SCORE</div>
              </div>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {messages.map((msg, i) => {
                const isMe = msg.senderId?._id === user.id || msg.senderId === user.id;
                return <MessageBubble key={msg._id || i} msg={msg} isSent={isMe} />;
              })}
              {typingPeer && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '0.75rem', opacity: 0.4, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="typing-dot" /> {selectedUser.auraName} is typing...
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '32px', borderTop: '1px solid #222', display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {isUploading ? <Loader2 size={20} className="spin" /> : <Paperclip size={20} />}
              </button>

              <input 
                value={input}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && handleSendText()}
                placeholder="Transmit a safe payload..."
                style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', padding: '16px 24px', color: '#fff', borderRadius: '16px', outline: 'none' }}
              />

              <button 
                onClick={handleSendText}
                style={{ background: 'var(--accent-primary)', border: 'none', color: '#000', padding: '0 32px', height: '50px', borderRadius: '16px', fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                SEND
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
            <MessageSquare size={120} />
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '10px', marginTop: '24px' }}>START A LINK</h2>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; borderRadius: 10px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .typing-dot { width: 6px; height: 6px; background: var(--accent-primary); borderRadius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Message;
