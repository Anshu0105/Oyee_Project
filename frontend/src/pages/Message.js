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
      display: 'grid', 
      gridTemplateColumns: '380px 1fr', 
      height: 'calc(100vh - 100px)', 
      margin: '0 20px 20px',
      background: '#000000',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden',
      color: '#fff'
    }}>
      
      {/* LEFT PANEL: VOID LINKS */}
      <div style={{ 
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.01)'
      }}>
        <div style={{ padding: '32px 24px 24px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '4px' }}>VOID LINKS</h1>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: '1px', marginBottom: '24px' }}>
            // ENCRYPTED P2P CHANNELS
          </p>
          
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input 
              type="text"
              placeholder="Search identities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }} className="custom-scrollbar">
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
                  background: isSelected ? 'rgba(255, 0, 85, 0.08)' : 'transparent',
                  borderLeft: isSelected ? '4px solid #FF0055' : '4px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s',
                  opacity: isSelected ? 1 : 0.6
                }}
              >
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {contact.avatarEmoji || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px' }}>{contact.auraName}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace' }}>@{contact.username.toLowerCase()}</div>
                </div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48bb78', boxShadow: '0 0 10px #48bb78' }} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT AREA */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div style={{ 
              padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                  border: `1px solid ${selectedUser.auraColor || 'rgba(255,255,255,0.1)'}`
                }}>
                  {selectedUser.avatarEmoji}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{selectedUser.auraName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', opacity: 0.4, letterSpacing: '1px' }}>
                    <ShieldCheck size={10} color="#FF0055" /> E2E ENCRYPTED • IDLE
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#FF0055', letterSpacing: '1px' }}>AURA</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.4 }}>REPUTATION SCORE</div>
              </div>
            </div>

            {/* MESSAGE LIST */}
            <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }} className="custom-scrollbar">
              {messages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem' }}>🌑</div>
                    <div style={{ fontWeight: '800', marginTop: '16px', letterSpacing: '2px' }}>BEGINNING OF VOID LINK</div>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} isSent={msg.senderId?._id === user.id || msg.senderId === user.id} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT SECTION */}
            <div style={{ padding: '32px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ 
                display: 'flex', gap: '16px', alignItems: 'center', 
                background: 'rgba(255,255,255,0.03)', padding: '8px 8px 8px 16px',
                borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  <Paperclip size={22} />
                </button>
                <input 
                  type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload}
                />
                
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendText()}
                  placeholder="Transmit a safe payload..."
                  style={{ 
                    flex: 1, background: 'transparent', border: 'none', padding: '12px 10px',
                    color: '#fff', fontSize: '1rem', outline: 'none'
                  }}
                />
                
                <button 
                  onClick={handleSendText}
                  style={{ 
                    background: '#FF0055', border: 'none', color: '#fff', padding: '14px 34px',
                    borderRadius: '12px', fontWeight: '800', fontSize: '1rem', letterSpacing: '1px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 0 20px rgba(255, 0, 85, 0.2)'
                  }}
                  className="hover-lift"
                >
                  {isUploading ? <Loader2 size={18} className="spin" /> : 'SEND'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={100} strokeWidth={1} />
              <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '8px', marginTop: '24px' }}>VOID LINKS</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
        .hover-lift:hover { transform: translateY(-2px); filter: brightness(1.1); }
      `}</style>
    </div>
  );
};

export default Message;
