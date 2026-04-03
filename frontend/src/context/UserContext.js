import React, { createContext, useContext, useState } from 'react';
import { safeFetch } from '../config';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('oyeeeToken') || null);
  const [user, setUser] = useState({
    name: 'Anonymous',
    aura: 0,
    friends: [],
    enemies: [],
    lastRooms: [],
    mood: 'happy',
    claimedItems: [],
    id: null,
    avatarEmoji: '👤',
    auraColor: '#FFFFFF'
  });

  const updateAura = (delta) => {
    setUser(prev => ({ 
      ...prev, 
      aura: prev.aura + delta,
      mood: delta > 0 ? 'happy' : 'sad'
    }));
    // Reset mood after 3 seconds
    setTimeout(() => {
      setUser(prev => ({ ...prev, mood: 'happy' }));
    }, 3000);
  };

  const addFriend = (name) => {
    setUser(prev => ({ ...prev, friends: [...prev.friends, name] }));
  };

  const addEnemy = (name) => {
    setUser(prev => ({ ...prev, enemies: [...prev.enemies, name] }));
  };

  const addClaimedItem = (item) => {
    setUser(prev => ({ ...prev, claimedItems: [...prev.claimedItems, item] }));
  };

  const loginUser = (data) => {
    setToken(data.token);
    localStorage.setItem('oyeeeToken', data.token);
    setUser(prev => ({
      ...prev,
      name: data.user.auraName || data.user.username,
      id: data.user.id,
      avatarEmoji: data.user.avatarEmoji,
      auraColor: data.user.auraColor
    }));
  };

  const logoutUser = () => {
    localStorage.removeItem('oyeeeToken');
    setToken(null);
    setUser({
      name: 'Tasty Strawberry', aura: 342, friends: [], enemies: [], lastRooms: ['WiFi Room'], mood: 'happy', claimedItems: [], id: null, avatarEmoji: '👤', auraColor: '#e91e63'
    });
    window.location.href = '/login';
  };

  const deleteAccount = async () => {
    try {
      await safeFetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      logoutUser();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <UserContext.Provider value={{ user, token, setToken, updateAura, addFriend, addEnemy, addClaimedItem, loginUser, logoutUser, deleteAccount }}>
      {children}
    </UserContext.Provider>
  );
};
