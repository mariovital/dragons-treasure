import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const WarpSpeedButton = ({ children, onClick, className, type = "button" }) => {
  const { darkMode } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const buttonRef = useRef(null);
  const particlesRef = useRef(null);
  
  // Create particles on mount
  useEffect(() => {
    if (particlesRef.current) {
      createParticles();
    }
  }, [particlesRef.current]);
  
  // Recreate particles when dark mode changes
  useEffect(() => {
    if (particlesRef.current) {
      createParticles();
    }
  }, [darkMode]);
  
  const createParticles = () => {
    const container = particlesRef.current;
    container.innerHTML = '';
    
    // Create particles in a surrounding pattern
    for (let i = 0; i < 60; i++) {
      const particle = document.createElement('div');
      
      // Randomize particle properties
      const size = Math.random() * 3 + 1;
      const angle = Math.random() * 360;
      
      // Position particles in a wider radius around the button
      // Some particles start outside the button for the enclosing effect
      const startDistance = Math.random() > 0.5 ? 
        (Math.random() * 80 + 40) : // Outside the button
        (Math.random() * 20); // Inside the button
      
      const endDistance = 10 + Math.random() * 100; // Varied end distances
      const duration = 0.8 + Math.random() * 0.6;
      const delay = Math.random() * 0.3;
      
      // Set particle styles
      particle.className = `absolute rounded-full opacity-0 ${
        darkMode 
          ? 'bg-blue-400' 
          : 'bg-primary-blue'
      }`;
      
      // Randomly choose colors for some particles
      if (i % 3 === 0) {
        particle.className = `absolute rounded-full opacity-0 ${
          darkMode ? 'bg-red-400' : 'bg-red-500'
        }`;
      } else if (i % 5 === 0) {
        particle.className = `absolute rounded-full opacity-0 ${
          darkMode ? 'bg-white' : 'bg-white'
        }`;
      } else if (i % 7 === 0) {
        particle.className = `absolute rounded-full opacity-0 ${
          darkMode ? 'bg-primary-yellow' : 'bg-primary-yellow'
        }`;
      }
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Calculate initial position
      const startX = Math.cos(angle * (Math.PI / 180)) * startDistance;
      const startY = Math.sin(angle * (Math.PI / 180)) * startDistance;
      
      particle.style.top = '50%';
      particle.style.left = '50%';
      particle.style.transform = `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`;
      
      // Store the particle's animation properties
      particle.dataset.angle = angle;
      particle.dataset.startDistance = startDistance;
      particle.dataset.endDistance = endDistance;
      particle.dataset.duration = duration;
      particle.dataset.delay = delay;
      particle.dataset.startX = startX;
      particle.dataset.startY = startY;
      
      container.appendChild(particle);
    }
  };
  
  const animateParticles = (isEntering) => {
    if (!particlesRef.current) return;
    
    const particles = particlesRef.current.childNodes;
    
    particles.forEach((particle) => {
      const angle = parseFloat(particle.dataset.angle);
      const startDistance = parseFloat(particle.dataset.startDistance);
      const endDistance = parseFloat(particle.dataset.endDistance);
      const duration = parseFloat(particle.dataset.duration);
      const delay = parseFloat(particle.dataset.delay);
      const startX = parseFloat(particle.dataset.startX);
      const startY = parseFloat(particle.dataset.startY);
      
      // Calculate end position based on angle and distance
      const endX = Math.cos(angle * (Math.PI / 180)) * endDistance;
      const endY = Math.sin(angle * (Math.PI / 180)) * endDistance;
      
      // Reset animation
      particle.animate(
        [
          { 
            transform: `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`,
            opacity: 0
          }
        ],
        { 
          duration: 0,
          fill: 'forwards'
        }
      );
      
      // Apply new animation
      if (isEntering) {
        // For particles starting outside, animate inward then outward
        // For particles starting inside, animate outward
        if (startDistance > 30) {
          // Outside particles - move inward then outward
          particle.animate(
            [
              { 
                transform: `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`,
                opacity: 0
              },
              { 
                transform: `translate(calc(-50% + ${startX * 0.3}px), calc(-50% + ${startY * 0.3}px))`,
                opacity: 0.8
              },
              { 
                transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px))`,
                opacity: 0
              }
            ],
            { 
              duration: duration * 1000,
              delay: delay * 1000,
              easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
              fill: 'forwards'
            }
          );
        } else {
          // Inside particles - move outward
          particle.animate(
            [
              { 
                transform: `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`,
                opacity: 0
              },
              { 
                transform: `translate(calc(-50% + ${startX * 1.5}px), calc(-50% + ${startY * 1.5}px))`,
                opacity: 0.8
              },
              { 
                transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px))`,
                opacity: 0
              }
            ],
            { 
              duration: duration * 1000,
              delay: delay * 1000,
              easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
              fill: 'forwards'
            }
          );
        }
      }
    });
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
    animateParticles(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
  const handleMouseDown = () => {
    setIsClicking(true);
    
    // Create a burst effect on click
    if (buttonRef.current) {
      buttonRef.current.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.95)' },
          { transform: 'scale(1.02)' },
          { transform: 'scale(1)' }
        ],
        { 
          duration: 400,
          easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.5)'
        }
      );
    }
    
    // Stronger particle burst on click
    if (particlesRef.current) {
      const particles = particlesRef.current.childNodes;
      
      particles.forEach((particle) => {
        const angle = parseFloat(particle.dataset.angle);
        const endDistance = parseFloat(particle.dataset.endDistance) || 0;
        const duration = (parseFloat(particle.dataset.duration) || 1) * 0.7;
        
        const burstMultiplier = 2.0;
        const endX = Math.cos(angle * (Math.PI / 180)) * endDistance * burstMultiplier;
        const endY = Math.sin(angle * (Math.PI / 180)) * endDistance * burstMultiplier;
        
        const startX = parseFloat(particle.dataset.startX) || 0;
        const startY = parseFloat(particle.dataset.startY) || 0;

        particle.animate(
          [
            { 
              transform: `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`,
              opacity: 0
            },
            { 
              transform: `translate(calc(-50% + ${endX * 0.3}px), calc(-50% + ${endY * 0.3}px))`,
              opacity: 0.9
            },
            { 
              transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px))`,
              opacity: 0
            }
          ],
          { 
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            fill: 'forwards'
          }
        );
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsClicking(false);
  };
  
  return (
    <div className="relative inline-block w-full">
      {/* Particles container - make it larger than the button for enclosing effect */}
      <div 
        ref={particlesRef}
        className="absolute inset-[-20px] pointer-events-none overflow-hidden rounded-xl"
      ></div>
      
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
          isHovering 
            ? 'opacity-70' 
            : 'opacity-0'
        } ${
          darkMode 
            ? 'bg-primary-blue/20 shadow-[0_0_15px_rgba(0,83,177,0.5)]' 
            : 'bg-primary-blue/10 shadow-[0_0_20px_rgba(0,83,177,0.3)]'
        }`}
      ></div>
      
      {/* Button */}
      <button
        ref={buttonRef}
        type={type}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`relative z-10 button-primary w-full py-3 transition-all duration-300 ${
          isHovering 
            ? 'shadow-lg' 
            : 'shadow-md'
        } ${
          isClicking 
            ? 'transform scale-95' 
            : ''
        } ${className || ''}`}
      >
        {children}
      </button>
    </div>
  );
};

export default WarpSpeedButton;