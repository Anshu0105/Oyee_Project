import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatArea from './components/ChatArea';
import ProfileModal from './components/ProfileModal';
import { LogOut, User, Menu, Hash, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';
import api from './axios';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('oyeee_token');
    const savedUser = localStorage.getItem('oyeee_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Initialize Socket and Fetch Rooms on Login
  useEffect(() => {
    if (!user) return;

    // Connect to Socket.IO and pass foodName as query for logs
    const newSocket = io('http://localhost:5000', {
      query: { foodName: user.foodName }
    });
    setSocket(newSocket);

    // Fetch available rooms
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data);
      } catch (err) {
        console.error('Failed to load rooms:', err);
      }
    };
    fetchRooms();

    return () => newSocket.close();
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    if (socket) socket.close();
    localStorage.removeItem('oyeee_token');
    localStorage.removeItem('oyeee_user');
    setUser(null);
    setSocket(null);
    setActiveRoom(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen bg-white dark:bg-discord-gray text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300 font-sans overflow-hidden relative">
      {/* Profile Modal */}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
      
      {/* Top Nav */}
      <nav className="h-14 border-b border-gray-200 dark:border-discord-darker flex items-center justify-between px-4 bg-gray-50 dark:bg-discord-dark shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-2">
          <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer md:hidden hover:text-gray-700 dark:hover:text-gray-200" />
          <div className="font-bold text-xl tracking-widest text-discord-brand select-none">OYEE.</div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="text-xs font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-md bg-gray-200 dark:bg-discord-light hover:bg-gray-300 dark:hover:bg-discord-darker text-gray-700 dark:text-gray-300 transition-colors"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          <div 
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 bg-gray-200 dark:bg-discord-darker px-2 py-1 md:py-1.5 md:px-3 rounded-md border border-gray-300 dark:border-transparent cursor-pointer hover:border-discord-brand dark:hover:border-discord-brand transition-colors select-none group"
            title="View Profile"
          >
            <div className="w-6 h-6 rounded-full bg-discord-brand flex items-center justify-center text-xs font-bold text-white shadow-inner group-hover:scale-105 transition-transform">
              {user.foodName.charAt(0)}
            </div>
            <span className="text-sm font-semibold max-w-[100px] md:max-w-[150px] truncate">{user.foodName}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-50 dark:bg-discord-darker border-r border-gray-200 dark:border-discord-dark shrink-0">
          <div className="p-4 flex flex-col gap-1 shadow-sm">
            <h2 className="uppercase text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider">Public Rooms</h2>
          </div>
          <div className="flex-1 overflow-y-auto pt-2 px-2 space-y-1">
            {rooms.length === 0 ? (
              <p className="text-sm text-gray-400 p-2">Loading rooms...</p>
            ) : (
              rooms.map((room) => (
                <div 
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    activeRoom?._id === room._id 
                      ? 'bg-gray-200 dark:bg-discord-light text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-discord-light hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Hash className="w-5 h-5 shrink-0" />
                  <span className="font-semibold text-sm truncate">{room.name}</span>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-discord-dark bg-gray-100 dark:bg-discord-darker flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-discord-brand" />
              Aura Score: <span className="text-discord-brand font-black text-sm">{user.aura}</span>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <ChatArea user={user} activeRoom={activeRoom} socket={socket} />
      </div>
    </div>
  );
}

export default App;
