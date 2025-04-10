import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900');
      document.body.classList.remove('bg-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
      document.body.classList.add('bg-white');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);