import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const AnimatedModeToggle = ({ className = '' }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const sunIconRef = useRef(null);
  const moonIconRef = useRef(null);
  const textRef = useRef(null);
  
  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Get the current and incoming icons
    const currentIcon = darkMode ? moonIconRef.current : sunIconRef.current;
    const incomingIcon = darkMode ? sunIconRef.current : moonIconRef.current;
    
    // Animate current icon up and out
    currentIcon.animate(
      [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(-20px)', opacity: 0 }
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      }
    );
    
    // Animate text fade out
    textRef.current.animate(
      [
        { opacity: 1 },
        { opacity: 0 }
      ],
      {
        duration: 150,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    );
    
    // After a small delay, animate the incoming icon up from below
    setTimeout(() => {
      incomingIcon.style.display = 'block';
      currentIcon.style.display = 'none';
      
      incomingIcon.animate(
        [
          { transform: 'translateY(20px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ],
        {
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        }
      );
      
      // Toggle the actual theme
      toggleDarkMode();
      
      // Animate text fade in with new content
      setTimeout(() => {
        textRef.current.animate(
          [
            { opacity: 0 },
            { opacity: 1 }
          ],
          {
            duration: 150,
            easing: 'ease-in-out',
            fill: 'forwards'
          }
        );
        
        // Reset animation state
        setTimeout(() => {
          setIsAnimating(false);
        }, 150);
      }, 100);
    }, 200);
  };
  
  // Set initial display state
  useEffect(() => {
    if (sunIconRef.current && moonIconRef.current) {
      sunIconRef.current.style.display = darkMode ? 'none' : 'block';
      moonIconRef.current.style.display = darkMode ? 'block' : 'none';
    }
  }, [darkMode]);
  
  return (
    <button
      onClick={handleToggle}
      className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
        darkMode 
          ? 'bg-[#2a2a2a]/60 hover:bg-[#2a2a2a]/80 border border-gray-700/50 text-gray-200' 
          : 'bg-[#ececec]/30 hover:bg-[#ececec]/50 border border-white/30 text-gray-800'
      } backdrop-blur-md ${className}`}
      disabled={isAnimating}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-6 h-6 mr-2 flex items-center justify-center">
        {/* Sun icon */}
        <div ref={sunIconRef} className="absolute inset-0 flex items-center justify-center">
          <Sun className="w-5 h-5 text-primary-yellow" />
        </div>
        
        {/* Moon icon */}
        <div ref={moonIconRef} className="absolute inset-0 flex items-center justify-center">
          <Moon className="w-5 h-5 text-blue-300" />
        </div>
      </div>
      
      {/* Mode text */}
      <span ref={textRef} className="text-sm font-medium">
        {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
      </span>
    </button>
  );
};

export default AnimatedModeToggle;