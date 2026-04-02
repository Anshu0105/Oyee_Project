import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('oyeeeToken') || null);
  const [user, setUser] = useState({
    name: 'Tasty Strawberry',
    aura: 0,
    auraCount: 0,
    friends: [],
    enemies: [],
    lastRooms: ['WiFi Room'],
    mood: 'happy',
    claimedItems: [],
    id: null,
    avatarEmoji: '👤',
    auraColor: '#e91e63'
  });
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
        const res = await fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(prev => ({
            ...prev,
            name: data.username,
            aura: data.aura || 0,
            auraCount: data.auraCount || 0,
            id: data._id
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [token]);

  const updateAura = async (deltaPoints, deltaCounts = 0) => {
    // Optimistic local update
    setUser(prev => ({ 
      ...prev, 
      aura: prev.aura + deltaPoints,
      auraCount: prev.auraCount + deltaCounts,
      mood: deltaPoints > 0 || deltaCounts > 0 ? 'happy' : 'sad'
    }));

    // Persist to backend if logged in
    if (token) {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
        await fetch(`${BACKEND_URL}/api/users/me/aura`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ deltaAura: deltaPoints, deltaCount: deltaCounts })
        });
      } catch (err) {
        console.error("Failed to sync aura with backend:", err);
      }
    }

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
        id: data.user.id,
        aura: data.user.aura || 0,
        auraCount: data.user.auraCount || 0
      }));

      return true;
    } catch(err) {
      console.error("Login bypass failed: ", err);
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('oyeeeToken');
    setToken(null);
    setUser({
      name: 'Tasty Strawberry', aura: 0, auraCount: 0, friends: [], enemies: [], lastRooms: ['WiFi Room'], mood: 'happy', claimedItems: [], id: null, avatarEmoji: '👤', auraColor: '#e91e63'
    });
    window.location.href = '/login';
  };

  const deleteAccount = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
      const res = await fetch(`${BACKEND_URL}/api/users/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Deletion failed');
      
      logoutUser();
    } catch(err) {
      console.error(err);
      alert('Failed to delete identity.');
    }
  };

  return (
    <UserContext.Provider value={{ user, token, loading, setToken, updateAura, addFriend, addEnemy, addClaimedItem, loginUser, logoutUser, deleteAccount }}>
      {children}
    </UserContext.Provider>
  );
};
