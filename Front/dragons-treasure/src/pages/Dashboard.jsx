
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Import decorative assets for additional elements
import blueCircleImg from '../assets/images/blue_circle.png';
import blueWaveImg from '../assets/images/blue_line.png';
import yellowDotsImg from '../assets/images/yellow_dots.png';
import yellowWaveImg from '../assets/images/yellow_line.png';

// Import all 11 Elementos_Aulify assets
import elemento1 from '../assets/Elementos_Aulify/elemento1.png';  // elemento07
import elemento2 from '../assets/Elementos_Aulify/elemento2.png';  // elemento11
import elemento3 from '../assets/Elementos_Aulify/elemento3.png';  // elemento17
import elemento4 from '../assets/Elementos_Aulify/elemento4.png';  // elemento21
import elemento5 from '../assets/Elementos_Aulify/elemento5.png';  // elemento27
import elemento6 from '../assets/Elementos_Aulify/elemento6.png';  // elemento28
import elemento7 from '../assets/Elementos_Aulify/elemento7.png';  // elemento35
import elemento8 from '../assets/Elementos_Aulify/elemento8.png';  // elemento38
import elemento9 from '../assets/Elementos_Aulify/elemento9.png';  // elemento41
import elemento10 from '../assets/Elementos_Aulify/elemento10.png'; // elemento43
import elemento11 from '../assets/Elementos_Aulify/elemento11.png'; // elemento45

// Import logo and navigation icons
import aulifyLogo from '../assets/images/Aulify_Logo.png';
import aulifyLogoWhite from '../assets/images/Aulify_Logo_White.png';
import dashboardIcon from '../assets/images/Dashboard_Logo.png';
import dashboardIconLight from '../assets/images/Dashboard_Light.png';
import estadisticasIcon from '../assets/images/Estadisticas_Logo.png';
import estadisticasIconLight from '../assets/images/Estadisticas_Light.png';
import configuracionIcon from '../assets/images/Configuracion_Logo.png';
import configuracionIconLight from '../assets/images/Configuracion_Light.png';
import darkModeIcon from '../assets/images/DarkMode_Logo.png';
import lightModeIcon from '../assets/images/Light_Mode.png';
import salirIcon from '../assets/images/Salir_Logo.png';
import salirIconLight from '../assets/images/Salir_Light.png';

// Import ParticlesBackground component
import ParticlesBackground from '../components/ParticlesBackground';

// Import chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import CrosstenLight font
import '../fonts/CrosstenLight.css';

const Dashboard = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backgroundElements, setBackgroundElements] = useState([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const containerRef = useRef(null);

  // Collection of all 11 Elementos_Aulify assets
  const elementosAulify = [
    elemento1, elemento2, elemento3, elemento4,
    elemento5, elemento6, elemento7, elemento8,
    elemento9, elemento10, elemento11
  ];

  // Generate physics-enabled background elements on component mount
  useEffect(() => {
    const generatePhysicsElements = () => {
      const elements = [];
      // Generate exactly 20 elements with physics properties
      const numElements = 20;
      
      for (let i = 0; i < numElements; i++) {
        const size = Math.random() * 100 + 80; // Size between 80px and 180px
        elements.push({
          id: i,
          image: elementosAulify[Math.floor(Math.random() * elementosAulify.length)],
          x: Math.random() * (window.innerWidth - size),
          y: Math.random() * (window.innerHeight - size),
          size: size,
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.3 + 0.2, // Between 0.2 and 0.5 for better visibility
          zIndex: Math.floor(Math.random() * 10),
          // Physics properties
          vx: (Math.random() - 0.5) * 1.5, // Increased horizontal velocity
          vy: (Math.random() - 0.5) * 1.5, // Increased vertical velocity
          mass: size / 40, // Balanced mass
          rotationSpeed: (Math.random() - 0.5) * 0.3, // Rotation speed
          elasticity: 0.85 + Math.random() * 0.15, // Higher elasticity for better bouncing
        });
      }
      return elements;
    };

    setBackgroundElements(generatePhysicsElements());

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Physics simulation loop
  useEffect(() => {
    if (backgroundElements.length === 0) return;

    const updatePhysics = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Skip if deltaTime is too large (tab was inactive)
      if (deltaTime > 100) {
        animationFrameRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      setBackgroundElements(prevElements => {
        const updatedElements = [...prevElements];
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Update positions and handle collisions
        for (let i = 0; i < updatedElements.length; i++) {
          const element = updatedElements[i];
          
          // Apply velocity with reduced speed factor
          element.x += element.vx * deltaTime * 0.06; // Reduced from 0.1
          element.y += element.vy * deltaTime * 0.06; // Reduced from 0.1
          element.rotation += element.rotationSpeed * deltaTime * 0.06; // Reduced from 0.1

          // Add slight random movement for liquid-like effect (reduced)
          element.vx += (Math.random() - 0.5) * 0.02; // Reduced from 0.04
          element.vy += (Math.random() - 0.5) * 0.02; // Reduced from 0.04
          
          // Boundary collisions with damping
          if (element.x < 0) {
            element.x = 0;
            element.vx = Math.abs(element.vx) * element.elasticity;
          } else if (element.x > containerWidth - element.size) {
            element.x = containerWidth - element.size;
            element.vx = -Math.abs(element.vx) * element.elasticity;
          }
          
          if (element.y < 0) {
            element.y = 0;
            element.vy = Math.abs(element.vy) * element.elasticity;
          } else if (element.y > containerHeight - element.size) {
            element.y = containerHeight - element.size;
            element.vy = -Math.abs(element.vy) * element.elasticity;
          }

          // Apply a balanced gravity (very small)
          element.vy += 0.0005; // Reduced gravity to prevent settling at bottom
          
          // Apply minimal drag/friction to maintain momentum
          element.vx *= 0.999; // Almost no horizontal drag
          element.vy *= 0.999; // Almost no vertical drag
          
          // Ensure minimum velocity to keep elements always moving
          const minVelocity = 0.1; // Higher minimum velocity
          const currentVelocity = Math.sqrt(element.vx * element.vx + element.vy * element.vy);
          
          if (currentVelocity < minVelocity) {
            // If moving too slowly, add random impulse in any direction
            const angle = Math.random() * Math.PI * 2;
            element.vx += Math.cos(angle) * (minVelocity + Math.random() * 0.3);
            element.vy += Math.sin(angle) * (minVelocity + Math.random() * 0.3);
          }
          
          // Occasionally add random directional impulses to create movement throughout the space
          if (Math.random() < 0.01) { // 1% chance per frame
            const angle = Math.random() * Math.PI * 2;
            element.vx += Math.cos(angle) * 0.3;
            element.vy += Math.sin(angle) * 0.3;
          }
          
          // Add forces to push elements toward the center if they're near edges
          const centerX = containerWidth / 2;
          const centerY = containerHeight / 2;
          const distanceFromCenterX = element.x + element.size/2 - centerX;
          const distanceFromCenterY = element.y + element.size/2 - centerY;
          
          // If element is in the outer 20% of the screen, add a small force toward center
          if (Math.abs(distanceFromCenterX) > containerWidth * 0.4 || 
              Math.abs(distanceFromCenterY) > containerHeight * 0.4) {
            element.vx -= distanceFromCenterX * 0.00002;
            element.vy -= distanceFromCenterY * 0.00002;
          }
        }

        // Check for collisions between elements
        for (let i = 0; i < updatedElements.length; i++) {
          for (let j = i + 1; j < updatedElements.length; j++) {
            const elementA = updatedElements[i];
            const elementB = updatedElements[j];
            
            // Calculate centers
            const centerAx = elementA.x + elementA.size / 2;
            const centerAy = elementA.y + elementA.size / 2;
            const centerBx = elementB.x + elementB.size / 2;
            const centerBy = elementB.y + elementB.size / 2;
            
            // Calculate distance between centers
            const dx = centerBx - centerAx;
            const dy = centerBy - centerAy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if colliding (using half sizes as radius)
            const minDistance = (elementA.size + elementB.size) / 2;
            
            if (distance < minDistance) {
              // Collision detected - calculate collision response
              const angle = Math.atan2(dy, dx);
              const overlap = minDistance - distance;
              
              // Move elements apart based on their mass
              const totalMass = elementA.mass + elementB.mass;
              const moveA = overlap * (elementB.mass / totalMass);
              const moveB = overlap * (elementA.mass / totalMass);
              
              // Move elements apart
              elementA.x -= Math.cos(angle) * moveA;
              elementA.y -= Math.sin(angle) * moveA;
              elementB.x += Math.cos(angle) * moveB;
              elementB.y += Math.sin(angle) * moveB;
              
              // Calculate velocity components along collision normal
              const vax = elementA.vx;
              const vay = elementA.vy;
              const vbx = elementB.vx;
              const vby = elementB.vy;
              
              // Calculate new velocities (elastic collision)
              const dampingFactor = 0.9; // Reduce energy slightly for stability
              
              // Apply impulse along collision normal
              const impulse = 2 * (vax * Math.cos(angle) + vay * Math.sin(angle) - 
                                  vbx * Math.cos(angle) - vby * Math.sin(angle)) / totalMass;
              
              elementA.vx -= (impulse * elementB.mass * Math.cos(angle)) * dampingFactor;
              elementA.vy -= (impulse * elementB.mass * Math.sin(angle)) * dampingFactor;
              elementB.vx += (impulse * elementA.mass * Math.cos(angle)) * dampingFactor;
              elementB.vy += (impulse * elementA.mass * Math.sin(angle)) * dampingFactor;
              
              // Add a bit of rotation on collision
              elementA.rotationSpeed += (Math.random() - 0.5) * 0.1;
              elementB.rotationSpeed += (Math.random() - 0.5) * 0.1;
              
              // Increase opacity briefly on collision for visual feedback
              elementA.opacity = Math.min(0.7, elementA.opacity + 0.1);
              elementB.opacity = Math.min(0.7, elementB.opacity + 0.1);
              
              // Gradually return to normal opacity
              setTimeout(() => {
                if (updatedElements[i]) updatedElements[i].opacity = Math.max(0.2, updatedElements[i].opacity - 0.1);
                if (updatedElements[j]) updatedElements[j].opacity = Math.max(0.2, updatedElements[j].opacity - 0.1);
              }, 300);
            }
          }
        }
        
        return updatedElements;
      });
      
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };
    
    animationFrameRef.current = requestAnimationFrame(updatePhysics);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [backgroundElements.length]);

  // Sample data for the time played chart
  const timePlayedData = [
    { day: 'Lunes', hours: 0.5 },
    { day: 'martes', hours: 2.5 },
    { day: 'miércoles', hours: 1.5 },
    { day: 'jueves', hours: 0.5 },
    { day: 'viernes', hours: 4.8 },
    { day: 'sábado', hours: 2.5 },
    { day: 'domingo', hours: 7 },
  ];

  // Sample data for recent games
  const recentGames = [
    { medal: '🥇', time: '1:44:10' },
    { medal: '❌', time: '2:30:22' },
    { medal: '❌', time: '3:05:50' },
    { medal: '🥈', time: '1:50:20' },
    { medal: '🥉', time: '2:00:40' },
  ];

  // Sample data for leaderboard
  const leaderboardData = [
    { medal: '🥇', time: '1:44:10', name: 'Luan' },
    { medal: '🥈', time: '1:44:10', name: 'Sofí' },
    { medal: '🥉', time: '1:44:10', name: 'Diana' },
    { medal: '➍', time: '1:44:10', name: 'Santiago' },
    { medal: '➎', time: '1:44:10', name: 'Hugo' },
  ];

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'text-white' : 'text-gray-800'} font-crossten`} ref={containerRef}>
      {/* Gradient background with organic circular feel */}
      <div className="fixed inset-0 bg-white overflow-hidden">
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-[#0F0C1D]' 
            : 'bg-white'
        }`}></div>
        
        {/* Organic circular gradient overlays - smaller sizes for more color variety */}
        <div className={`absolute w-[80%] h-[80%] rounded-full blur-[80px] -top-[5%] -left-[5%] ${
          darkMode ? 'bg-[#331A1D]/70' : 'bg-[#F6BA27]/30'
        }`}></div>
        
        <div className={`absolute w-[70%] h-[70%] rounded-full blur-[90px] top-[40%] -right-[10%] ${
          darkMode ? 'bg-[#001E3D]/80' : 'bg-[#52BEDA]/30'
        }`}></div>
        
        <div className={`absolute w-[60%] h-[60%] rounded-full blur-[100px] -bottom-[10%] left-[30%] ${
          darkMode ? 'bg-[#1A4D5C]/70' : 'bg-[#0053B1]/20'
        }`}></div>
        
        <div className={`absolute w-[50%] h-[50%] rounded-full blur-[70px] top-[15%] left-[40%] ${
          darkMode ? 'bg-[#001F33]/60' : 'bg-[#D44D56]/20'
        }`}></div>
        
        {/* Additional small organic shapes for texture and color variety */}
        <div className={`absolute w-[25%] h-[25%] rounded-full blur-[60px] top-[60%] left-[15%] ${
          darkMode ? 'bg-[#331A1D]/40' : 'bg-[#1D1934]/10'
        }`}></div>
        
        <div className={`absolute w-[20%] h-[20%] rounded-full blur-[50px] top-[20%] left-[10%] ${
          darkMode ? 'bg-[#1A4D5C]/50' : 'bg-[#F6BA27]/20'
        }`}></div>
        
        <div className={`absolute w-[30%] h-[30%] rounded-full blur-[70px] bottom-[15%] right-[15%] ${
          darkMode ? 'bg-[#001E3D]/60' : 'bg-[#52BEDA]/25'
        }`}></div>
      </div>
      
      {/* Add the particles background */}
      <ParticlesBackground />
      
      {/* Decorative background with physics-enabled Elementos_Aulify assets */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Physics-enabled Elementos_Aulify assets */}
        {backgroundElements.map((element) => (
          <img 
            key={element.id}
            src={element.image} 
            alt=""
            className="absolute object-contain" 
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              opacity: element.opacity,
              transform: `rotate(${element.rotation}deg)`,
              zIndex: element.zIndex,
              transition: 'opacity 0.3s ease-in-out',
              filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))',
              imageRendering: 'auto',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
              transformStyle: 'preserve-3d'
            }}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
      
      {/* Main content wrapper - Using CSS Grid */}
      <div className="relative min-h-screen grid grid-cols-[320px_1fr]">
        {/* Sidebar - Enhanced glass effect */}
        <div className="z-40 h-screen overflow-hidden">
          <div className={`h-full py-5 px-9 flex flex-col rounded-3xl overflow-y-auto ${
            darkMode 
              ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 text-gray-200 shadow-lg' 
              : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
          }`} style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
            
            {/* Logo */}
            <div className="mb-7 flex justify-center">
              <div className="h-12 w-36 flex items-center justify-center">
                <img 
                  src={darkMode ? aulifyLogoWhite : aulifyLogo} 
                  alt="Aulify" 
                  className="h-full object-contain" 
                />
              </div>
            </div>

            {/* User welcome section - Enhanced glass effect */}
            <div className="mb-9 flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-4 relative">
                {/* Yellow circle background with glass effect */}
                <div className={`w-full h-full ${darkMode ? 'bg-primary-yellow/40' : 'bg-primary-yellow/60'} rounded-full absolute backdrop-blur-sm ${darkMode ? 'border border-gray-700/50' : 'border border-white/30'}`}></div>
                {/* Avatar */}
                <div className="w-full h-full flex items-center justify-center relative">
                  <span className="text-3xl">🐭</span>
                </div>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bienvenido,</p>
                <p className="font-bold text-lg mt-1">Usuario</p>
              </div>
            </div>

            {/* Navigation - Enhanced glass effect */}
            <nav className="flex-1">
              <ul className="space-y-5">
                <li>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                      activeTab === 'dashboard' 
                        ? `font-bold ${darkMode ? 'bg-[#2a2a2a]/70' : 'bg-[#ececec]/60'} backdrop-blur-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/40'} shadow-sm` 
                        : `font-normal ${darkMode ? 'hover:bg-[#2a2a2a]/50' : 'hover:bg-[#ececec]/50'} hover:backdrop-blur-lg hover:border hover:border-white/20`
                    }`}
                  >
                    <span className="mr-3 w-7 h-7 flex items-center justify-center">
                      <img src={darkMode ? dashboardIconLight : dashboardIcon} alt="Dashboard" className="w-5 h-5" />
                    </span>
                    <span className="text-base">Dashboard</span>
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveTab('statistics')}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                      activeTab === 'statistics' 
                        ? `font-bold ${darkMode ? 'bg-[#2a2a2a]/70' : 'bg-[#ececec]/60'} backdrop-blur-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/40'} shadow-sm` 
                        : `font-normal ${darkMode ? 'hover:bg-[#2a2a2a]/50' : 'hover:bg-[#ececec]/50'} hover:backdrop-blur-lg hover:border hover:border-white/20`
                    }`}
                  >
                    <span className="mr-3 w-7 h-7 flex items-center justify-center">
                      <img src={darkMode ? estadisticasIconLight : estadisticasIcon} alt="Estadísticas" className="w-5 h-5" />
                    </span>
                    <span className="text-base">Estadísticas</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('configuration')}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                      activeTab === 'configuration' 
                        ? `font-bold ${darkMode ? 'bg-[#2a2a2a]/70' : 'bg-[#ececec]/60'} backdrop-blur-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/40'} shadow-sm` 
                        : `font-normal ${darkMode ? 'hover:bg-[#2a2a2a]/50' : 'hover:bg-[#ececec]/50'} hover:backdrop-blur-lg hover:border hover:border-white/20`
                    }`}
                  >
                    <span className="mr-3 w-7 h-7 flex items-center justify-center">
                      <img src={darkMode ? configuracionIconLight : configuracionIcon} alt="Configuración" className="w-5 h-5" />
                    </span>
                    <span className="text-base">Configuración</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Bottom actions - Enhanced glass effect */}
            <div className="mt-auto pt-3 space-y-3">
              <button 
                onClick={toggleDarkMode}
                className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                  darkMode ? 'bg-[#2a2a2a]/60 hover:bg-[#2a2a2a]/80 border border-gray-700/50' : 'bg-[#ececec]/30 hover:bg-[#ececec]/50 border border-white/30'
                } backdrop-blur-md`}
              >
                <span className="mr-3 w-7 h-7 flex items-center justify-center">
                  <img src={darkMode ? lightModeIcon : darkModeIcon} alt="Dark Mode" className="w-5 h-5" />
                </span>
                <span className="text-base">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button 
                className={`flex items-center w-full p-3 rounded-xl text-red-400 transition-all duration-200 mb-1 ${
                  darkMode ? 'bg-[#2a2a2a]/60 hover:bg-[#2a2a2a]/80 border border-gray-700/50' : 'bg-[#ececec]/30 hover:bg-[#ececec]/50 border border-white/30'
                } backdrop-blur-md`}
              >
                <span className="mr-3 w-7 h-7 flex items-center justify-center">
                  <img src={darkMode ? salirIconLight : salirIcon} alt="Salir" className="w-5 h-5" />
                </span>
                <span className="text-base">Salir</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="p-8 overflow-auto">
          <h1 className="text-4xl font-bold mb-10 mt-4">Dashboard</h1>
          
          {/* Dashboard content grid - Enhanced glass effect for all cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Level Progress Card - Enhanced glass effect */}
            <div className={`rounded-3xl p-8 ${
              darkMode 
                ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 text-gray-200' 
                : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30'
            }`} style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-2xl font-bold mb-8">Nivel</h2>
              <div className="flex items-center justify-center space-x-10">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold">1</span>
                  <div className={`mt-3 ${darkMode ? 'bg-[#2a2a2a]/80 text-gray-300' : 'bg-[#ececec]/80 text-gray-800'} rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-md ${darkMode ? 'border border-gray-700/50' : 'border border-white/40'} shadow-sm`}>
                    <span className="text-2xl">★</span>
                  </div>
                </div>
                
                <div className="text-4xl">→</div>
                
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold">2</span>
                  <div className={`mt-3 ${darkMode ? 'bg-[#2a2a2a]/60 text-gray-500' : 'bg-[#ececec]/60 text-gray-500'} rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-md ${darkMode ? 'border border-gray-700/40' : 'border border-white/30'} shadow-sm`}>
                    <span className="text-2xl">✪</span>
                  </div>
                </div>
              </div>
              <p className="text-center mt-8 text-base">5 puntos para subir</p>
            </div>
            
            {/* Gameplay Time Chart - Enhanced glass effect */}
            <div className={`rounded-3xl p-8 ${
              darkMode 
                ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 text-gray-200' 
                : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30'
            }`} style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-2xl font-bold font-mono mb-8">Tiempo de Juego</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timePlayedData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: darkMode ? 'rgba(26, 26, 26, 0.8)' : 'rgba(236, 236, 236, 0.6)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(16px)',
                      border: darkMode ? '1px solid rgba(70, 70, 70, 0.4)' : '1px solid rgba(255, 255, 255, 0.4)',
                      color: darkMode ? '#e0e0e0' : '#333',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                    }} />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#0053B1" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#52BEDA", stroke: "#0053B1", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#52BEDA", stroke: "#0053B1", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Matches Panel - Enhanced glass effect */}
            <div className={`rounded-3xl p-8 ${
              darkMode 
                ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 text-gray-200' 
                : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30'
            }`} style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-2xl font-bold mb-8">Últimas 5 partidas.</h2>
              <div className="space-y-5">
                {recentGames.map((game, index) => (
                  <div key={index} className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700/30' : 'border-[#ececec]/70'}`}>
                    <span className="text-3xl">{game.medal}</span>
                    <span className="text-2xl">{game.time}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Leaderboard - Enhanced glass effect */}
            <div className={`rounded-3xl p-8 ${
              darkMode 
                ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 text-gray-200' 
                : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30'
            }`} style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-2xl font-bold mb-8">Leaderboard</h2>
              <div className="space-y-5">
                {leaderboardData.map((player, index) => (
                  <div key={index} className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700/30' : 'border-[#ececec]/70'}`}>
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{player.medal}</span>
                      <span className="text-2xl">{player.time}</span>
                    </div>
                    <span className="text-2xl">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
