import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const DEFAULT_USER = {
  name: 'Void Wanderer',
  auraName: null,
  aura: 0,
  spendableAura: 0,
  lifetimeAura: 0,
  maxLifetimeAura: 0,
  friends: [],
  enemies: [],
  lastRooms: [],
  mood: 'happy',
  claimedItems: [],
  id: null,
  email: null,
  avatarEmoji: '👤',
  auraColor: '#e91e63'
};

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('oyeeeToken') || null);
  const [user, setUser] = useState(DEFAULT_USER);
  const [socket, setSocket] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

  useEffect(() => {
    if (token) {
      const newSocket = io(BACKEND_URL);
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        if (user.id) newSocket.emit('authenticate', user.id);
      });

      return () => newSocket.close();
    }
  }, [token, user.id]);

  const updateAura = useCallback((delta) => {
    setUser(prev => ({ 
      ...prev, 
      aura: prev.aura + delta,
      mood: delta > 0 ? 'happy' : 'sad'
    }));
    // Reset mood after 3 seconds
    setTimeout(() => {
      setUser(prev => ({ ...prev, mood: 'happy' }));
    }, 3000);
  }, []);

  const addFriend = (name) => {
    setUser(prev => ({ ...prev, friends: [...prev.friends, name] }));
  };

  const addEnemy = (name) => {
    setUser(prev => ({ ...prev, enemies: [...prev.enemies, name] }));
  };

  const addClaimedItem = (item) => {
    setUser(prev => ({ ...prev, claimedItems: [...prev.claimedItems, item] }));
  };

  const initiateLogin = async (email) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
      const res = await fetch(`${BACKEND_URL}/api/auth/initiate-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate login');
      
      if (data.directLogin) {
        setToken(data.token);
        localStorage.setItem('oyeeeToken', data.token);
        setUser(prev => ({
          ...prev,
          name: data.user.username,
          id: data.user.id
        }));
        return { directLogin: true };
      }
      
      return { directLogin: false };
    } catch(err) {
      console.error("Initiate login failed: ", err);
      throw err;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      setToken(data.token);
      localStorage.setItem('oyeeeToken', data.token);
      setUser(prev => ({
        ...prev,
        name: data.user.username,
        id: data.user.id
      }));
      return true;
    } catch(err) {
      console.error("OTP verification failed: ", err);
      throw err;
    }
  };

  // login: called after successful signup or login from Auth page
  const login = useCallback((newToken, userData) => {
    setToken(newToken);
    localStorage.setItem('oyeeeToken', newToken);
    setUser(prev => ({
      ...prev,
      id: userData.id,
      name: userData.username || userData.auraName || 'Void Wanderer',
      auraName: userData.auraName || null,
      email: userData.email || null,
      avatarEmoji: userData.avatarEmoji || '👤',
      spendableAura: userData.spendableAura || 0,
      lifetimeAura: userData.lifetimeAura || 0,
      maxLifetimeAura: userData.maxLifetimeAura || 0,
      auraColor: userData.auraColor || '#e91e63'
    }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('oyeeeToken');
    if (socket) socket.close();
    setSocket(null);
    setUser(DEFAULT_USER);
  }, [socket]);

  return (
    <UserContext.Provider value={{ user, token, socket, setToken, updateAura, addFriend, addEnemy, addClaimedItem, initiateLogin, verifyOTP, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
