import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../config';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

// Initialize socket at modular level
const socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnection: true
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('oyeee-user')) || null);
  const [token, setToken] = useState(localStorage.getItem('oyeee-token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Sync auth state with socket
  useEffect(() => {
    if (token && user) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit('authenticate', user._id);
      
      const handleNotif = (notif) => {
        setNotifications(prev => [notif, ...prev]);
      };
      
      socket.on('notificationReceived', handleNotif);
      return () => {
        socket.off('notificationReceived', handleNotif);
      };
    } else {
      if (socket.connected) socket.disconnect();
    }
  }, [token, user]);

  // Fetch notifications on load
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/me/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error('Failed to sync notifications');
    }
  };

  const markNotificationsRead = async (id = null) => {
    try {
      await fetch(`${BACKEND_URL}/api/users/me/notifications/read`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ notificationId: id })
      });
      
      if (id) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark read');
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('oyeee-token', data.token);
        localStorage.setItem('oyeee-user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network synchronization failed' };
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setNotifications([]);
    localStorage.removeItem('oyeee-token');
    localStorage.removeItem('oyeee-user');
    socket.disconnect();
  };

  const updateAura = (amt) => {
    setUser(prev => {
      const newUser = { ...prev, aura: (prev?.aura || 0) + amt };
      localStorage.setItem('oyeee-user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const addClaimedItem = (item) => {
    setUser(prev => {
      const newUser = { ...prev, claimedItems: [...(prev?.claimedItems || []), item] };
      localStorage.setItem('oyeee-user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const bypassLogin = () => {
    const fakeUser = {
      _id: 'guest_' + Date.now(),
      username: 'Guest_User',
      auraName: 'Mysterious Guest',
      aura: 500,
      avatarEmoji: '⚡',
      friends: [],
      enemies: [],
      notifications: []
    };
    const fakeToken = 'guest_token_' + Date.now();
    setUser(fakeUser);
    setToken(fakeToken);
    localStorage.setItem('oyeee-user', JSON.stringify(fakeUser));
    localStorage.setItem('oyeee-token', fakeToken);
    return true;
  };

  return (
    <UserContext.Provider value={{ 
      user, token, loginUser, logoutUser, loading, setLoading, 
      updateAura, addClaimedItem, notifications, markNotificationsRead, socket, bypassLogin
    }}>
      {children}
    </UserContext.Provider>
  );
};
