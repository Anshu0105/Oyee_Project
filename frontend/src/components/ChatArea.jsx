import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Zap } from 'lucide-react';
import api from '../axios';

const ChatArea = ({ user, activeRoom, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch past messages & join room
  useEffect(() => {
    if (!activeRoom || !socket) return;

    // Join room via socket
    socket.emit('join_room', activeRoom.name);

    // Fetch message history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/rooms/${activeRoom.name}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();

    // Socket message listeners
    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUpdate = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    socket.on('receive_message', handleReceive);
    socket.on('update_message', handleUpdate);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('update_message', handleUpdate);
    };
  }, [activeRoom, socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const data = {
      roomName: activeRoom.name,
      senderId: user._id,
      content: newMessage,
    };

    // Emit via socket
    socket.emit('send_message', data);
    setNewMessage('');
  };

  const handleVote = async (messageId, action) => {
    try {
      // Optimistic or waiting for socket update. Better wait for socket 'update_message' to avoid sync issues.
      await api.post(`/rooms/messages/${messageId}/aura`, { action });
    } catch (err) {
      console.error('Vote failed:', err.response?.data?.error || err.message);
    }
  };

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-discord-gray">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Select a room to start chatting</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-discord-gray h-full transition-colors duration-300">
      {/* Chat header */}
      <div className="h-14 border-b border-gray-200 dark:border-discord-darker flex items-center px-6 shrink-0 bg-white dark:bg-discord-gray z-10 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-xl text-discord-brand">#</span> {activeRoom.name}
        </h3>
        <span className="ml-auto text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-discord-dark px-2 py-1 rounded">
          {activeRoom.type}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isMine = m.senderId?._id === user._id;
          const senderName = m.senderId?.foodName || 'Unknown';
          const senderAura = m.senderId?.aura || 0;

          return (
            <div key={m._id} className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1 px-1">
                <span className={`text-sm font-bold ${isMine ? 'text-discord-brand' : 'text-gray-800 dark:text-gray-200'}`}>
                  {senderName}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Aura: {senderAura}</span>
              </div>
              
              <div className={`p-3 rounded-2xl relative group ${
                isMine 
                  ? 'bg-discord-brand text-white rounded-tr-none shadow-md' 
                  : 'bg-gray-100 dark:bg-discord-darker text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-discord-dark shadow-sm'
              }`}>
                <p className="text-sm md:text-base leading-relaxed break-words">{m.content}</p>

                {/* Aura voting buttons (Visible on hover or via bottom row if you want) */}
                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-discord-dark px-2 py-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 ${
                  isMine ? '-left-20' : '-right-20'
                }`}>
                  {!isMine && (
                    <>
                      <button onClick={() => handleVote(m._id, 'upvote')} className="text-gray-400 hover:text-green-500 transition-colors p-1" title="Upvote">
                        <Zap className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleVote(m._id, 'downvote')} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Downvote">
                        <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">-</span>
                      </button>
                    </>
                  )}
                  <span className={`text-xs font-bold px-1 ${m.auraScore >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {m.auraScore} ⚡
                  </span>
                </div>
              </div>
              {/* Fallback for mobile or sticky aura score */}
              <div className="md:hidden mt-1 text-[10px] font-semibold text-gray-400">
                {m.auraScore} ⚡
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div className="p-4 bg-white dark:bg-discord-gray border-t border-gray-200 dark:border-discord-darker shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${activeRoom.name}`}
            className="w-full bg-gray-100 dark:bg-discord-darker text-gray-900 dark:text-gray-100 border border-transparent focus:border-discord-brand dark:focus:border-discord-brand rounded-lg pl-4 pr-24 py-3.5 focus:outline-none transition-colors shadow-sm"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button type="button" className="p-2 text-gray-400 hover:text-discord-brand transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-2 bg-discord-brand hover:bg-discord-brand_hover text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-discord-brand"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
