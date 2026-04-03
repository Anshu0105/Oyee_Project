import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('oyeee-theme') || 'wine';
  });

  const toggleTheme = () => {
    const cycle = ['wine', 'blue', 'green', 'gold', 'orange'];
    setTheme(prev => {
        const nextIdx = (cycle.indexOf(prev) + 1) % cycle.length;
        return cycle[nextIdx];
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    localStorage.setItem('oyeee-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
