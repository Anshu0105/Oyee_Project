import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { MessageSquare, ChevronLeft, Paperclip, Loader2, Send, Search, ShieldCheck } from 'lucide-react';
import io from 'socket.io-client';
import MessageBubble from '../components/UI/MessageBubble';
import { BACKEND_URL, safeFetch } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const Message = () => {
  const { user, token } = useUser();
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('receiveDirectMessage', (payload) => {
      // Logic to only add if it belongs to current chat
      const isFromSelected = selectedUser && (payload.senderId?._id === selectedUser._id || payload.senderId === selectedUser._id);
      const isFromMe = payload.senderId?._id === user.id || payload.senderId === user.id;
      
      if (isFromSelected || isFromMe) {
        setMessages(prev => [...prev, payload]);
      }
    });

    fetchAvailableUsers();

    return () => {
      socketRef.current.disconnect();
    };
  }, [token, selectedUser, user.id]);

  useEffect(() => {
    if (selectedUser && token) {
      fetchChatHistory(selectedUser._id);
      const peers = [user.id, selectedUser._id].sort();
      const channel = `dm_${peers[0]}_${peers[1]}`;
      socketRef.current.emit('joinRoom', channel);
    }
  }, [selectedUser, token, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const data = await safeFetch('/api/dm/available-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (Array.isArray(data)) setContacts(data);
    } catch(err) { console.error(err); }
  };

  const fetchChatHistory = async (peerId) => {
    try {
      const data = await safeFetch(`/api/dm/history/${peerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(data);
    } catch(err) { console.error(err); }
  };

  const handleSendText = () => {
    if (!input.trim() || !selectedUser) return;
    const payload = {
      senderId: user.id,
      receiverId: selectedUser._id,
      content: input,
      type: 'text'
    };
    socketRef.current.emit('sendDirectMessage', payload);
    setInput('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedUser) return;
    if (file.size > 25 * 1024 * 1024) return alert("File exceeds 25MB limit");

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await safeFetch('/api/dm/upload-file', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const payload = {
        senderId: user.id,
        receiverId: selectedUser._id,
        content: data.fileName,
        type: 'file',
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize
      };
      socketRef.current.emit('sendDirectMessage', payload);
    } catch(err) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.auraName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 80px)',
      background: 'var(--bg-main)',
      overflow: 'hidden',
      color: 'var(--text-main)',
      position: 'relative'
    }}>
      
      {/* LEFT PANEL: VOID LINKS (Scrollable) */}
      <div style={{ 
        width: isMobile ? '100%' : '380px',
        borderRight: '1px solid var(--border-main)', 
        display: (isMobile && selectedUser) ? 'none' : 'flex', 
        flexDirection: 'column',
        background: 'var(--bg-panel)',
        height: '100%',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{ padding: '32px 24px 24px' }}>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '4px' }}>VOID LINKS</h1>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: '1px', marginBottom: '24px' }}>
            // ENCRYPTED P2P CHANNELS
          </p>
          
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input 
              type="text"
              placeholder="Search identities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-main)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="scroll-container" style={{ flex: 1, padding: '0 12px 24px' }}>
          {filteredContacts.map(contact => {
            const isSelected = selectedUser?._id === contact._id;
            return (
              <motion.div 
                key={contact._id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedUser(contact)}
                style={{ 
                  padding: '16px', 
                  borderRadius: '16px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--glass)' : 'transparent',
                  borderLeft: isSelected ? `4px solid var(--accent-primary)` : '4px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s',
                  opacity: isSelected ? 1 : 0.6
                }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                  border: '1px solid var(--border-main)'
                }}>
                  {contact.avatarEmoji || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{contact.auraName}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.4, fontFamily: 'monospace' }}>@{contact.username.toLowerCase()}</div>
                </div>
                <div style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', 
                  background: isSelected ? 'var(--accent-primary)' : '#48bb78',
                  boxShadow: isSelected ? `0 0 10px var(--accent-primary)` : '0 0 10px #48bb78'
                }} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT AREA (3 Parts) */}
      <div style={{ 
        flex: 1, 
        display: (isMobile && !selectedUser) ? 'none' : 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg-main)', 
        height: '100%', 
        overflow: 'hidden' 
      }}>
        {selectedUser ? (
          <>
            {/* 1. HEADER (Fixed) */}
            <div style={{ 
              padding: isMobile ? '12px 20px' : '20px 32px', 
              borderBottom: '1px solid var(--border-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-panel)', backdropFilter: 'blur(10px)', zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isMobile && (
                  <button 
                    onClick={() => setSelectedUser(null)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  border: `1px solid ${selectedUser.auraColor || 'var(--border-main)'}`
                }}>
                  {selectedUser.avatarEmoji}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem' }}>{selectedUser.auraName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', opacity: 0.4, letterSpacing: '0.5px' }}>
                    <ShieldCheck size={10} style={{ color: 'var(--accent-primary)' }} /> E2E SECURE
                  </div>
                </div>
              </div>
              
              {!isMobile && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '1px' }}>AURA</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.4 }}>REPUTATION SCORE</div>
                </div>
              )}
            </div>

            {/* 2. MESSAGE LIST (Scrollable) */}
            <div className="scroll-container" style={{ flex: 1, padding: isMobile ? '20px' : '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem' }}>🌑</div>
                    <div style={{ fontWeight: '800', marginTop: '12px', letterSpacing: '2px', fontSize: '0.8rem' }}>VOID LINK INITIALIZED</div>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} isSent={msg.senderId?._id === user.id || msg.senderId === user.id} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. INPUT SECTION (Fixed) */}
            <div style={{ padding: isMobile ? '16px' : '24px 32px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-main)' }}>
              <div style={{ 
                display: 'flex', gap: '8px', alignItems: 'center', 
                background: 'rgba(255,255,255,0.03)', padding: '6px 6px 6px 14px',
                borderRadius: '16px', border: '1px solid var(--border-main)'
              }}>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '8px' }}
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload}
                />
                
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendText()}
                  placeholder="Transmit message..."
                  style={{ 
                    flex: 1, background: 'transparent', border: 'none', padding: '10px 4px',
                    color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
                
                <button 
                  onClick={handleSendText}
                  className="interactive"
                  style={{ 
                    background: 'var(--accent-primary)', border: 'none', color: '#fff', padding: isMobile ? '12px' : '12px 28px',
                    borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 0 15px var(--glass-border)'
                  }}
                >
                  {isUploading ? <Loader2 size={18} className="spin" /> : (isMobile ? <Send size={18} /> : 'SEND')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={isMobile ? 60 : 100} strokeWidth={1} />
              <div style={{ fontSize: isMobile ? '1.2rem' : '2rem', fontWeight: '900', letterSpacing: '8px', marginTop: '24px' }}>VOID LINKS</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Message;
