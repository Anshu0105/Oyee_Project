import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Tasty Strawberry',
    aura: 342,
    friends: [],
    enemies: [],
    lastRooms: ['WiFi Room'],
    mood: 'happy',
    claimedItems: []
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

  return (
    <UserContext.Provider value={{ user, updateAura, addFriend, addEnemy, addClaimedItem }}>
      {children}
    </UserContext.Provider>
  );
};
