import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('to-dark');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);
  
  const toggleDarkMode = () => {
    setIsTransitioning(true);
    setTransitionDirection(darkMode ? 'to-light' : 'to-dark');
    
    // Apply the theme change immediately
    setDarkMode(prev => !prev);
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
    
    // End transition after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, isTransitioning, transitionDirection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);