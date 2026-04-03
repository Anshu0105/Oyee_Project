import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { MessageSquare, ChevronLeft, Paperclip, Loader2 } from 'lucide-react';
import io from 'socket.io-client';
import MessageBubble from '../components/UI/MessageBubble';
import { BACKEND_URL, safeFetch } from '../config';
const Message = () => {
  const { user, token } = useUser();
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Socket and fetch available peers
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(BACKEND_URL);

    // Listen for incoming DMs
    socketRef.current.on('receiveDirectMessage', (payload) => {
      // If the message involves the current user, add it to state if we are currently looking at that chat
      // In a real app we'd update unread counters if looking elsewhere
      setMessages(prev => [...prev, payload]);
    });

    fetchAvailableUsers();

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  // Fetch chat history whenever selectedUser changes
  useEffect(() => {
    if (selectedUser && token) {
      fetchChatHistory(selectedUser._id);
      
      // We join the virtual socket room named dm_USER1_USER2
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
      
      if (Array.isArray(data)) {
        setContacts(data);
      } else {
        console.error("Failed to fetch contacts:", data);
        setContacts([]);
      }
    } catch(err) {
      console.error(err);
      setContacts([]);
    }
  };

  const fetchChatHistory = async (peerId) => {
    try {
      const data = await safeFetch(`/api/dm/history/${peerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(data);
    } catch(err) {
      console.error(err);
    }
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

    // Validate size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert("File exceeds 25MB limit");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await safeFetch('/api/dm/upload-file', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      // Successfully uploaded via Multer, now send via Socket
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
      // Reset input element
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(320px, 400px) 1fr', 
      height: 'calc(100vh - 88px)', 
      margin: '0 24px 24px',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      border: '1px solid var(--glass-border)',
      fontFamily: 'var(--font-inter)',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Sidebar (Inbox) */}
      <div style={{ borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '2px', lineHeight: 1, marginBottom: '4px' }}>
            MESSAGES
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '16px' }}>
             // untraced peer-to-peer data links
          </p>
          <div style={{ width: '32px', height: '3px', background: 'var(--accent-primary)', borderRadius: '2px', marginBottom: '24px' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', letterSpacing: '1px' }}>
              ACTIVE IDENTITIES ({contacts.length})
            </div>
            <button 
              onClick={fetchAvailableUsers}
              style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-dim)', fontSize: '0.6rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              REFRESH
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.map(contact => (
            <div 
              key={contact._id}
              onClick={() => setSelectedUser(contact)}
              style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid var(--glass-border)',
                background: selectedUser?._id === contact._id ? 'rgba(255,255,255,0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '1.5rem', background: 'var(--bg-light)', padding: '8px', borderRadius: '50%', border: '1px solid var(--glass-border)' }}>
                {contact.avatarEmoji}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '1px' }}>
                  {contact.auraName} {contact.equippedBadge}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-primary)' }}>
                  {contact.username} // ID:{contact._id.slice(-4)}
                </span>
              </div>
              <div style={{ marginLeft: 'auto', width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%', boxShadow: '0 0 8px var(--accent-green)' }} />
            </div>
          ))}
          {contacts.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              NO OTHER USERS CURRENTLY LOGGED IN.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area (Chat Bag) */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid var(--glass-border)', 
              background: 'rgba(255,255,255,0.02)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setSelectedUser(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    color: 'var(--accent-primary)', background: 'transparent', border: '1px solid var(--glass-border)', padding: '6px 10px',
                    borderRadius: '4px', cursor: 'pointer', letterSpacing: '1px'
                  }}
                >
                  <ChevronLeft size={14} /> BACK
                </button>
                
                <div>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.5rem', color: 'var(--text-main)', letterSpacing: '1px', lineHeight: 1, marginBottom: '4px' }}>
                    {selectedUser.auraName.toUpperCase()} {selectedUser.equippedBadge}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                    {selectedUser.aura} aura • End-To-End Direct Link
                  </div>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '4px 12px', borderRadius: '4px', letterSpacing: '1px', background: 'rgba(233, 30, 99, 0.1)' }}>
                NO MODERATION ZONE
              </div>
            </div>
            
            {/* Chat History ("Chat Bag") */}
            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
              
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  Beginning of Direct Transmission
                  <br /><br />
                  Warning: Content is unmoderated. Links and Personal Information are permitted.
                </div>
              )}

              {messages.map((msg, i) => {
                const isSent = msg.senderId?._id === user.id || msg.senderId === user.id;

                return <MessageBubble key={i} msg={msg} isSent={isSent} />;
              })}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Bottom */}
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ background: 'var(--bg-light)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s', opacity: isUploading ? 0.5 : 1 }}
                className="hover-lift"
              >
                {isUploading ? <Loader2 size={20} className="spin" /> : <Paperclip size={20} />}
                <span style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '1px', fontSize: '1rem' }}>ATTACH</span>
              </button>

              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendText()}
                placeholder="type anything... (unmoderated payload)"
                style={{ 
                  flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '16px 20px', 
                  color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', outline: 'none', borderRadius: '8px'
                }}
              />
              
              <button 
                onClick={handleSendText}
                className="interactive hover-lift" 
                style={{ 
                  background: 'var(--accent-primary)', border: 'none', color: '#ffffff', padding: '0 32px', height: '100%',
                  fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '2px', cursor: 'pointer', borderRadius: '8px',
                }}
              >
                SEND
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15, color: 'var(--text-main)' }}>
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={80} style={{ marginBottom: '24px' }} />
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '6px' }}>SELECT AN IDENTITY</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '8px' }}>// initiate anonymous direct link</p>
            </div>
          </div>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Message;
