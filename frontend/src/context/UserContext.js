import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('oyeeeToken') || null);
  const [user, setUser] = useState({
    name: 'Tasty Strawberry',
    aura: 342,
    friends: [],
    enemies: [],
    lastRooms: ['WiFi Room'],
    mood: 'happy',
    claimedItems: [],
    id: null,
    avatarEmoji: '👤',
    auraColor: '#e91e63'
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

  const loginUser = async (email) => {
    try {
      const adjectives = ['Quantum', 'Neon', 'Cosmic', 'Midnight', 'Phantom', 'Cyber', 'Ghost', 'Stardust', 'Echo'];
      const nouns = ['Wanderer', 'Ninja', 'Rider', 'Pulse', 'Specter', 'Vagabond', 'Walker', 'Nova'];
      const randomPrefix = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomSuffix = nouns[Math.floor(Math.random() * nouns.length)];
      const randomId = Math.floor(Math.random() * 10000);
      const username = `${randomPrefix}${randomSuffix}${randomId}`;
      const password = 'oyeee_default';
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

      // Attempt to login
      let res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      // If user not found, dynamically register them!
      if (res.status === 404) {
        res = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        if (!res.ok) throw new Error('Failed to bootstrap new identity');
        
        // Auto-login after registration
        res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication error');

      setToken(data.token);
      localStorage.setItem('oyeeeToken', data.token);
      
      setUser(prev => ({
        ...prev,
        name: data.user.username,
        id: data.user.id
      }));

      return true;
    } catch(err) {
      console.error("Login bypass failed: ", err);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, token, setToken, updateAura, addFriend, addEnemy, addClaimedItem, loginUser }}>
      {children}
    </UserContext.Provider>
  );
};
