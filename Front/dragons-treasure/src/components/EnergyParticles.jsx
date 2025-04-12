import React, { useEffect, useState } from 'react';

const EnergyParticles = ({ active, darkMode }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (active) {
      // Create 15 particles
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 8 + 2,
        delay: Math.random() * 0.5,
        color: darkMode 
          ? `rgba(${Math.floor(Math.random() * 50 + 200)}, ${Math.floor(Math.random() * 100 + 150)}, ${Math.floor(Math.random() * 50)}, ${Math.random() * 0.5 + 0.3})`
          : `rgba(${Math.floor(Math.random() * 50 + 200)}, ${Math.floor(Math.random() * 100 + 150)}, ${Math.floor(Math.random() * 50)}, ${Math.random() * 0.5 + 0.3})`
      }));
      
      setParticles(newParticles);
      
      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [active, darkMode]);
  
  if (!active || particles.length === 0) return null;
  
  return (
    <div className="absolute bottom-0 left-0 w-full h-20 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute animate-particleFade rounded-full"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            bottom: '0'
          }}
        />
      ))}
    </div>
  );
};

export default EnergyParticles;