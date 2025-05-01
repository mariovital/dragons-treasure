import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

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

// --- Helper function to format time (assuming value is in seconds) ---
// NOTE: Ensure the backend returns duracion_partida in total seconds
// or adjust this function accordingly if it returns 'HH:MM:SS' format.
const formatTime = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return '--:--:--';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  // Format as H:MM:SS
  return `${hours.toString()}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
// --- End Helper ---

const Dashboard = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backgroundElements, setBackgroundElements] = useState([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const containerRef = useRef(null);

  // State for dynamic data
  const [recentGamesData, setRecentGamesData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [errorRecent, setErrorRecent] = useState(null);
  const [errorLeaderboard, setErrorLeaderboard] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // Initialize userInfo as null

  // --- NEW State for Time Played Chart ---
  const [timePlayedChartData, setTimePlayedChartData] = useState([]);
  const [loadingTimePlayed, setLoadingTimePlayed] = useState(true); // Start loading
  const [errorTimePlayed, setErrorTimePlayed] = useState(null);
  // --- End NEW State ---

  // Placeholder for the logged-in user's ID
  // Replace this with your actual way of getting the user ID (e.g., from auth context)
  const currentUserId = 1; 

  // Collection of all 11 Elementos_Aulify assets
  const elementosAulify = [
    elemento1, elemento2, elemento3, elemento4,
    elemento5, elemento6, elemento7, elemento8,
    elemento9, elemento10, elemento11
  ];

  // --- Effect 1: Get User Info and Token on Mount ---
  useEffect(() => {
    console.log("[Effect 1] Running: Reading localStorage...");
    const storedUserData = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('aulifyToken');

    if (storedUserData) {
        try {
            const parsedData = JSON.parse(storedUserData);
            if (parsedData && parsedData.id) { // Ensure parsed data has an ID
                console.log("[Effect 1] User data FOUND and parsed, setting state:", parsedData);
                setUserInfo(parsedData); // Store user data in state
            } else {
                console.error("[Effect 1] Parsed user data is invalid or missing ID.");
                setErrorRecent("Invalid user data in storage.");
                setErrorLeaderboard("Invalid user data in storage.");
                setLoadingRecent(false); // Stop loading if data is bad
                setLoadingLeaderboard(false);
            }
        } catch (e) {
            console.error("[Effect 1] Failed to parse user data from localStorage", e);
            setErrorRecent("Corrupt user data found.");
            setErrorLeaderboard("Corrupt user data found.");
            setLoadingRecent(false); // Stop loading on parse error
            setLoadingLeaderboard(false);
        }
    } else {
        console.warn("[Effect 1] User data NOT found in localStorage.");
        setErrorRecent("User data not found. Please login again.");
        setErrorLeaderboard("User data not found. Please login again.");
        setLoadingRecent(false); // Stop loading if no user data
        setLoadingLeaderboard(false);
    }
    
    if (!storedToken) {
         console.warn("[Effect 1] Aulify token NOT found in localStorage.");
         // Set error only if another error isn't already present
         setErrorRecent(prev => prev || "Auth token is missing.");
         setLoadingRecent(false); // Also stop loading if token is missing
         setLoadingLeaderboard(false);
         setLoadingTimePlayed(false); // Stop time played loading too
    }

  }, []); // Run only once on mount

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

  // --- Effect 3: Fetch data (depends on userInfo state) ---
  useEffect(() => {
    console.log("[Effect 3] Running: Checking userInfo state:", userInfo);
    const token = localStorage.getItem('aulifyToken');
    const currentUserId = userInfo?.id; // Get ID from potentially updated state

    // --- Exit conditions --- 
    if (!currentUserId) {
        console.log("[Effect 3] Skipping fetch: User ID is missing from state.");
        if (!loadingRecent && !loadingLeaderboard && !loadingTimePlayed) return;
        setLoadingRecent(false);
        setLoadingLeaderboard(false);
        setLoadingTimePlayed(false); // Ensure this stops too
        return; 
    }
    if (!token) {
         console.log("[Effect 3] Skipping fetch: Token is missing from localStorage.");
         setLoadingRecent(false);
         setLoadingLeaderboard(false);
         setLoadingTimePlayed(false); // Ensure this stops too
         return;
      }

    console.log(`[Effect 3] User ID (${currentUserId}) and Token found. Proceeding with fetch.`);

    // Clear errors related to missing data ONLY if we are about to fetch
    setErrorRecent(prev => (prev === "User ID is missing." || prev === "User data not found." || prev === "Invalid user data in storage." || prev === "Corrupt user data found." || prev === "Auth token is missing.") ? null : prev);
    setErrorLeaderboard(prev => (prev === "User data not found." || prev === "Invalid user data in storage." || prev === "Corrupt user data found.") ? null : prev);
    setErrorTimePlayed(prev => (prev === "User ID is missing." || prev === "User data not found." || prev === "Invalid user data in storage." || prev === "Corrupt user data found." || prev === "Auth token is missing.") ? null : prev);
    
    // Set loading states
    setLoadingRecent(true); 
    setLoadingLeaderboard(true);
    setLoadingTimePlayed(true); // Start loading time played

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    let recentGamesFetched = false;
    let leaderboardFetched = false;
    let timePlayedFetched = false; // Track time played fetch

    // --- Fetch Recent Games ---    
    const fetchRecentGames = async () => {
      // setErrorRecent(null); // Error cleared above
      try {
        console.log(`[Effect 3] Fetching recent games for user ${currentUserId}...`);
        const response = await fetch(`http://localhost:3000/estadistica/ultimas-partidas/${currentUserId}`, {
            method: 'GET',
            headers: headers
        }); 
        
        if (!response.ok) {
            const errorText = await response.text(); 
            console.error(`[Effect 3] Failed fetch recent games. Status: ${response.status}, Response: ${errorText}`);
            if (response.status === 401 || response.status === 403) {
                 throw new Error(`Authentication failed`);
            }
            throw new Error(`Server error (${response.status})`);
        }
        const data = await response.json();
        console.log("[Effect 3] Recent games data received:", data);
        setRecentGamesData(data);
      } catch (error) {
        console.error("[Effect 3] Catch block: Error fetching recent games:", error);
        setErrorRecent(error.message || 'Could not load recent games.');
      } finally {
        recentGamesFetched = true;
        // Stop global loading only when ALL fetches are done
        if (leaderboardFetched && timePlayedFetched) {
            setLoadingRecent(false);
            setLoadingLeaderboard(false);
            setLoadingTimePlayed(false);
        }
      }
    };

    // --- Fetch Leaderboard ---    
    const fetchLeaderboard = async () => {
      // setErrorLeaderboard(null); // Error cleared above
      try {
        console.log("[Effect 3] Fetching leaderboard...");
        const response = await fetch('http://localhost:3000/estadistica/leaderboard', {
            method: 'GET',
            headers: headers
        }); 
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Effect 3] Failed fetch leaderboard. Status: ${response.status}, Response: ${errorText}`);
            if (response.status === 401 || response.status === 403) {
                 throw new Error(`Authentication failed`);
            }
            throw new Error(`Server error (${response.status})`);
        }
        const data = await response.json();
        console.log("[Effect 3] Leaderboard data received:", data);
        setLeaderboardData(data);
      } catch (error) {
        console.error("[Effect 3] Catch block: Error fetching leaderboard:", error);
        setErrorLeaderboard(error.message || 'Could not load leaderboard.');
      } finally {
        leaderboardFetched = true;
        // Stop global loading only when ALL fetches are done
         if (recentGamesFetched && timePlayedFetched) {
             setLoadingRecent(false);
             setLoadingLeaderboard(false);
             setLoadingTimePlayed(false);
        }
      }
    };

    // --- NEW: Fetch Time Played --- 
    const fetchTimePlayed = async () => {
      try {
        console.log(`[Effect 3] Fetching time played for user ${currentUserId}...`);
        const response = await fetch(`http://localhost:3000/estadistica/tiempo-jugado/${currentUserId}`, {
            method: 'GET',
            headers: headers
        }); 
        
        if (!response.ok) {
            const errorText = await response.text(); 
            console.error(`[Effect 3] Failed fetch time played. Status: ${response.status}, Response: ${errorText}`);
            if (response.status === 401 || response.status === 403) {
                 throw new Error(`Authentication failed`);
            }
            throw new Error(`Server error (${response.status})`);
        }
        const data = await response.json();
        console.log("[Effect 3] Time played data received:", data);

        // --- Transform data for the chart --- 
        const transformedData = data.map(item => ({
            day: new Date(item.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' }), // Get short weekday name (lun., mar., etc.)
            hours: parseFloat((item.totalSeconds / 3600).toFixed(1)) // Convert seconds to hours (1 decimal place)
        }));
        console.log("[Effect 3] Transformed time played data:", transformedData);
        setTimePlayedChartData(transformedData);
        
      } catch (error) {
        console.error("[Effect 3] Catch block: Error fetching time played:", error);
        setErrorTimePlayed(error.message || 'Could not load time played data.');
      } finally {
        timePlayedFetched = true;
        // Stop global loading only when ALL fetches are done
        if (recentGamesFetched && leaderboardFetched) {
            setLoadingRecent(false);
            setLoadingLeaderboard(false);
            setLoadingTimePlayed(false);
        }
      }
    };

    // Call all fetch functions
    fetchRecentGames();
    fetchLeaderboard();
    fetchTimePlayed(); // Call the new fetch function

  }, [userInfo]);

  // Sample data for the time played chart (keep for now, replace if needed)
  const timePlayedData = [
    { day: 'Lunes', hours: 0.5 },
    { day: 'martes', hours: 2.5 },
    { day: 'miércoles', hours: 1.5 },
    { day: 'jueves', hours: 0.5 },
    { day: 'viernes', hours: 4.8 },
    { day: 'sábado', hours: 2.5 },
    { day: 'domingo', hours: 7 },
  ];

  // --- Helper to get medal icon based on rank ---
  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      case 4: return '➍'; // Using Unicode dingbats for 4 and 5
      case 5: return '➎';
      default: return `${rank}`; // Fallback for ranks > 5
    }
  };

  // --- Handle Logout ---
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('userData');
    localStorage.removeItem('aulifyToken');
    navigate('/'); // Redirect to login page (assuming it's the root route)
  };
  // --- End Handle Logout ---

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
      <div className="relative min-h-screen grid grid-cols-[250px_1fr]">
        {/* Sidebar - Enhanced glass effect */}
        <div className="z-40 h-[95vh] overflow-auto">
          <div className={`h-full py-2 px-6 flex flex-col rounded-3xl ${
            darkMode 
              ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 text-gray-200 shadow-lg' 
              : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
          }`} style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
            
            {/* Logo */}
            <div className="mb-2 flex justify-center">
              <div className="h-10 w-36 flex items-center justify-center">
                <img 
                  src={darkMode ? aulifyLogoWhite : aulifyLogo} 
                  alt="Aulify" 
                  className="h-full object-contain" 
                />
              </div>
            </div>

            {/* User welcome section - Use userInfo state */}
            <div className="mb-3 flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-1 relative">
                {/* Yellow circle background with glass effect */}
                <div className={`w-full h-full ${darkMode ? 'bg-primary-yellow/40' : 'bg-primary-yellow/60'} rounded-full absolute backdrop-blur-sm ${darkMode ? 'border border-gray-700/50' : 'border border-white/30'}`}></div>
                {/* Avatar */}
                <div className="w-full h-full flex items-center justify-center relative">
                  <span className="text-3xl">🐭</span>
                </div>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bienvenido,</p>
                {/* Display gamertag from userInfo state, fallback if needed */}
                <p className="font-bold text-lg mt-0">{userInfo?.gamertag || 'Usuario'}</p>
              </div>
            </div>

            {/* Navigation - Enhanced glass effect */}
            <nav className="flex-1">
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center w-full p-2 rounded-xl transition-all duration-200 ${
                      activeTab === 'dashboard' 
                        ? `font-bold ${darkMode ? 'bg-[#2a2a2a]/70' : 'bg-[#ececec]/60'} backdrop-blur-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/40'} shadow-sm` 
                        : `font-normal ${darkMode ? 'hover:bg-[#2a2a2a]/50' : 'hover:bg-[#ececec]/50'} hover:backdrop-blur-lg hover:border hover:border-white/20`
                    }`}
                  >
                    <span className="mr-3 w-6 h-6 flex items-center justify-center">
                      <img src={darkMode ? dashboardIconLight : dashboardIcon} alt="Dashboard" className="w-4 h-4" />
                    </span>
                    <span className="text-sm">Dashboard</span>
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveTab('statistics')}
                    className={`flex items-center w-full p-2 rounded-xl transition-all duration-200 ${
                      activeTab === 'statistics' 
                        ? `font-bold ${darkMode ? 'bg-[#2a2a2a]/70' : 'bg-[#ececec]/60'} backdrop-blur-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/40'} shadow-sm` 
                        : `font-normal ${darkMode ? 'hover:bg-[#2a2a2a]/50' : 'hover:bg-[#ececec]/50'} hover:backdrop-blur-lg hover:border hover:border-white/20`
                    }`}
                  >
                    <span className="mr-3 w-6 h-6 flex items-center justify-center">
                      <img src={darkMode ? estadisticasIconLight : estadisticasIcon} alt="Estadísticas" className="w-4 h-4" />
                    </span>
                    <span className="text-sm">Estadísticas</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('configuration')}
                    className={`flex items-center w-full p-2 rounded-xl transition-all duration-200 ${
                      activeTab === 'configuration' 
                        ? `font-bold ${darkMode ? 'bg-[#2a2a2a]/70' : 'bg-[#ececec]/60'} backdrop-blur-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/40'} shadow-sm` 
                        : `font-normal ${darkMode ? 'hover:bg-[#2a2a2a]/50' : 'hover:bg-[#ececec]/50'} hover:backdrop-blur-lg hover:border hover:border-white/20`
                    }`}
                  >
                    <span className="mr-3 w-6 h-6 flex items-center justify-center">
                      <img src={darkMode ? configuracionIconLight : configuracionIcon} alt="Configuración" className="w-4 h-4" />
                    </span>
                    <span className="text-sm">Configuración</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* --- Sidebar Bottom Buttons --- */}
            <div className="mt-auto pt-4 border-t ${darkMode ? 'border-gray-700/50' : 'border-white/30'}">
              <ul className="space-y-2">
                 {/* Dark Mode Toggle Button */}
                 <li>
                   <button
                      onClick={toggleDarkMode}
                      className={`flex items-center w-full p-2 rounded-xl transition-all duration-200 text-sm ${darkMode ? 'hover:bg-[#2a2a2a]/50' : 'hover:bg-[#ececec]/50'} hover:backdrop-blur-lg hover:border hover:border-white/20`}
                   >
                     <span className="mr-3 w-6 h-6 flex items-center justify-center">
                       <img src={darkMode ? lightModeIcon : darkModeIcon} alt="Toggle Theme" className="w-4 h-4" />
                     </span>
                     <span>Modo {darkMode ? 'Claro' : 'Oscuro'}</span>
                   </button>
                 </li>
                 {/* Logout Button */}
                 <li>
                   <button 
                      onClick={handleLogout} 
                      className={`flex items-center w-full p-2 rounded-xl transition-all duration-200 text-sm ${darkMode ? 'hover:bg-red-800/40 text-red-400' : 'hover:bg-red-100/60 text-red-600'} hover:backdrop-blur-lg hover:border hover:border-red-500/20`}
                   >
                     <span className="mr-3 w-6 h-6 flex items-center justify-center">
                       <img src={darkMode ? salirIconLight : salirIcon} alt="Salir" className="w-4 h-4" />
                     </span>
                     <span>Salir</span>
                   </button>
                 </li>
              </ul>
            </div>
            {/* --- End Sidebar Bottom Buttons --- */}

          </div>
        </div>

        {/* Main Content Area */}
        <div className="z-40 h-[95vh] overflow-y-auto py-2 px-8">
          {/* Conditional Rendering based on activeTab */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Recent Games Card */}
                <div className={`p-6 rounded-2xl ${
                  darkMode
                    ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg'
                    : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
                }`}>
                  <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Últimas 5 partidas</h2>
                  {loadingRecent ? (
                    <p className="text-sm text-gray-500">Cargando partidas recientes...</p>
                  ) : errorRecent ? (
                    <p className="text-sm text-red-500">Error: {errorRecent}</p>
                  ) : recentGamesData.length > 0 ? (
                    <ul className="space-y-3">
                      {recentGamesData.map((game, index) => (
                        <li key={index} className={`flex justify-between items-center text-sm p-2 rounded-lg ${
                          darkMode ? 'bg-black/20' : 'bg-white/30'
                        }`}>
                          <span className={`font-medium ${game.outcome === 'victory' ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                            {game.outcome === 'victory' ? '🏆 Victoria' : '💀 Derrota'}
                          </span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {formatTime(game.time)} {/* Use formatTime helper */}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No hay partidas recientes registradas.</p>
                  )}
                </div>

                {/* Leaderboard Card */}
                <div className={`p-6 rounded-2xl ${
                  darkMode
                    ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg'
                    : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
                }`}>
                  <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Leaderboard (Top 5 - Victorias)</h2>
                   {loadingLeaderboard ? (
                    <p className="text-sm text-gray-500">Cargando leaderboard...</p>
                  ) : errorLeaderboard ? (
                    <p className="text-sm text-red-500">Error: {errorLeaderboard}</p>
                  ) : leaderboardData.length > 0 ? (
                    <ol className="space-y-3">
                       {leaderboardData.map((entry, index) => (
                         <li key={index} className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                           darkMode ? 'bg-black/20' : 'bg-white/30'
                         }`}>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold w-6 text-center">{getMedalIcon(entry.rank)}</span> {/* Use getMedalIcon */}
                            <span className={`font-medium ${darkMode ? 'text-primary-yellow' : 'text-blue-700'}`}>{entry.name}</span> {/* Display gamertag */}
                          </div>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                             {formatTime(entry.time)} {/* Use formatTime helper */}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-gray-500">El leaderboard está vacío.</p>
                  )}
                </div>

                {/* Time Played Chart Card - UPDATED */}
                <div className={`md:col-span-2 p-6 rounded-2xl ${ 
                  darkMode 
                    ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg' 
                    : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
                }`}>
                  <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Tiempo Jugado (Últimos 7 días)</h2>
                  {
                    loadingTimePlayed ? (
                      <p className="text-sm text-gray-500">Cargando datos de tiempo jugado...</p>
                    ) : errorTimePlayed ? (
                      <p className="text-sm text-red-500">Error: {errorTimePlayed}</p>
                    ) : timePlayedChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timePlayedChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                          <XAxis dataKey="day" stroke={darkMode ? '#999' : '#666'} tick={{ fontSize: 12 }} />
                          <YAxis stroke={darkMode ? '#999' : '#666'} tick={{ fontSize: 12 }} label={{ value: 'Horas', angle: -90, position: 'insideLeft', fill: darkMode ? '#999' : '#666', fontSize: 12, dx: -5 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: darkMode ? '#333' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
                            itemStyle={{ color: darkMode ? '#ddd' : '#333' }} 
                            labelStyle={{ fontWeight: 'bold', color: darkMode ? '#fff' : '#000' }} 
                            formatter={(value) => [`${value} horas`, 'Tiempo']} // Format tooltip content
                          />
                          <Line type="monotone" dataKey="hours" stroke={darkMode ? '#F6BA27' : '#0053B1'} strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-gray-500">No hay datos de tiempo jugado para los últimos 7 días.</p>
                    )
                  }
                </div>

              </div>
            </div>
          )}

          {/* Placeholder for Statistics Tab Content */}
          {activeTab === 'statistics' && (
             <div className={`p-6 rounded-2xl ${
                  darkMode
                    ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg'
                    : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
                }`}>
                <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Estadísticas</h1>
                <p className="text-sm text-gray-500">El contenido detallado de estadísticas irá aquí.</p>
             </div>
          )}

          {/* Placeholder for Configuration Tab Content */}
          {activeTab === 'configuration' && (
             <div className={`p-6 rounded-2xl ${
                  darkMode
                    ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg'
                    : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
                }`}>
                <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Configuración</h1>
                <p className="text-sm text-gray-500">Las opciones de configuración irán aquí.</p>
                {/* Dark Mode Toggle Example */}
                <div className="mt-4">
                    <button
                      onClick={toggleDarkMode}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${darkMode ? 'bg-primary-yellow text-gray-900 hover:bg-yellow-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      <img src={darkMode ? lightModeIcon : darkModeIcon} alt="Toggle Theme" className="w-4 h-4" />
                      <span>Cambiar a Modo {darkMode ? 'Claro' : 'Oscuro'}</span>
                    </button>
                </div>
             </div>
          )}

        {/* END OF MAIN CONTENT AREA DIV */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;