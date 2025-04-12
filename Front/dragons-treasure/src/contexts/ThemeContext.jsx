import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('to-dark'); // 'to-dark' or 'to-light'
  
  useEffect(() => {
    // Check if user has a preference stored
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);
  
  const toggleDarkMode = () => {
    setIsTransitioning(true);
    setTransitionDirection(darkMode ? 'to-light' : 'to-dark');
    
    // Small delay to ensure transition starts properly
    setTimeout(() => {
      setDarkMode(prev => !prev);
      
      // Save preference to localStorage
      localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
      
      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 50);
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, isTransitioning, transitionDirection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);