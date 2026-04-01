import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('oyeee-theme') || 'wine';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'wine') return 'blue';
      if (prev === 'blue') return 'titanium';
      return 'wine';
    });
  };


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('oyeee-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
