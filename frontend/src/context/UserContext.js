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
    auraVotesGiven: [],
    claimedItems: [],
    id: null,
    avatarEmoji: '👤',
    auraColor: '#FFFFFF',
    theme: 'wine',
    streak: 7
  });

  const updateAura = async (targetUserId, type) => {
    try {
      const data = await safeFetch(`/api/users/aura/${targetUserId}`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      
      // Update local state history of given votes
      setUser(prev => ({ 
        ...prev, 
        auraVotesGiven: [...prev.auraVotesGiven, { userId: targetUserId, type }]
      }));
      return data;
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const addFriend = async (targetUserId) => {
    try {
      await safeFetch(`/api/users/relationship/${targetUserId}`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'friend' })
      });
      setUser(prev => ({ 
        ...prev, 
        friends: [...prev.friends, targetUserId],
        enemies: prev.enemies.filter(id => id !== targetUserId)
      }));
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const addEnemy = async (targetUserId) => {
    try {
      await safeFetch(`/api/users/relationship/${targetUserId}`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'enemy' })
      });
      setUser(prev => ({ 
        ...prev, 
        enemies: [...prev.enemies, targetUserId],
        friends: prev.friends.filter(id => id !== targetUserId)
      }));
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const data = await safeFetch('/api/users/me/profile', {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      setUser(prev => ({ 
          ...prev, 
          ...updates, 
          avatarEmoji: data.avatarEmoji || prev.avatarEmoji,
          theme: data.theme || prev.theme,
          auraColor: data.auraColor || prev.auraColor
      }));
      return data;
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const loginUser = (data) => {
    setToken(data.token);
    localStorage.setItem('oyeeeToken', data.token);
    setUser({
      name: data.user.auraName,
      auraName: data.user.auraName,
      id: data.user.id || data.user._id,
      aura: data.user.auraPoints || data.user.aura || 0,
      avatarEmoji: data.user.avatarEmoji,
      auraColor: data.user.auraColor,
      theme: data.user.theme || 'wine',
      friends: data.user.friends || [],
      enemies: data.user.enemies || [],
      auraVotesGiven: data.user.auraVotes?.given || [],
      claimedItems: data.user.claimedItems || []
    });
  };

  const logoutUser = () => {
    localStorage.removeItem('oyeeeToken');
    setToken(null);
    setUser({
      name: 'Anonymous', aura: 0, friends: [], enemies: [], auraVotesGiven: [], id: null, avatarEmoji: '👤', auraColor: '#FFFFFF', theme: 'wine', claimedItems: []
    });
    window.location.href = '/';
  };

  const deleteAccount = async (password) => {
    try {
      await safeFetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      logoutUser();
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const addClaimedItem = (item) => {
    setUser(prev => ({ 
      ...prev, 
      claimedItems: [...(prev.claimedItems || []), item] 
    }));
  };

  return (
    <UserContext.Provider value={{ user, token, setToken, updateAura, addFriend, addEnemy, addClaimedItem, updateProfile, loginUser, logoutUser, deleteAccount }}>
      {children}
    </UserContext.Provider>
  );
};
