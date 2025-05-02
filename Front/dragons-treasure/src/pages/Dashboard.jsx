import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Coins, Sparkles } from 'lucide-react';

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

// --- Helper function to format time (HH:MM:SS for game results) ---
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

// --- NEW Helper function to format duration (X h Y min) for charts/tooltips ---
const formatDurationForChart = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) {
    return '--'; 
  }
  if (totalSeconds < 60) {
    return `0 min`; 
  }
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours} h`; // Use 'h' for brevity in chart
  }
  if (minutes > 0) {
    if (result.length > 0) result += ' ';
    result += `${minutes} min`; // Use 'min' for brevity
  }
  
  if (result === '') {
      return '0 min';
  }

  return result;
};
// --- End Helpers ---

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
  const [userInfo, setUserInfo] = useState(null);

  // --- NEW State for Time Played Chart ---
  const [timePlayedChartData, setTimePlayedChartData] = useState([]);
  const [loadingTimePlayed, setLoadingTimePlayed] = useState(true);
  const [errorTimePlayed, setErrorTimePlayed] = useState(null);

  // --- NEW State for Coins and Sticker ---
  const [coinsData, setCoinsData] = useState(null); // { coins: number } | null
  const [stickerData, setStickerData] = useState(null); // { sticker: { name, description, image } | null } | null
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [loadingSticker, setLoadingSticker] = useState(true);
  const [errorCoins, setErrorCoins] = useState(null);
  const [errorSticker, setErrorSticker] = useState(null);

  // Ref to track if initial data fetch has been performed for the current user
  const hasFetchedData = useRef(false);

  // Placeholder for the logged-in user's ID -- REMOVED, now from userInfo
  // const currentUserId = 1; 

  // Collection of all 11 Elementos_Aulify assets
  const elementosAulify = [
    elemento1, elemento2, elemento3, elemento4,
    elemento5, elemento6, elemento7, elemento8,
    elemento9, elemento10, elemento11
  ];

  // --- Refactored Data Fetching Logic --- 
  // useCallback ensures this function reference is stable unless dependencies change
  const fetchDashboardData = useCallback(async () => {
    const ourToken = localStorage.getItem('token'); // Read our JWT
    const aulifyApiToken = localStorage.getItem('aulifyToken'); // Read Aulify's token
    const currentUserId = userInfo?.id;

    // Exit if essential data is missing
    if (!currentUserId || !ourToken) { // Check for our token now
        console.log("[fetchDashboardData] Skipping: Missing userId or our token.");
        // Ensure loading is off if we skip
        setLoadingRecent(false);
        setLoadingLeaderboard(false);
        setLoadingTimePlayed(false);
        setLoadingCoins(false);
        setLoadingSticker(false);
        return;
    }
    
    // Log presence of Aulify token for debugging
    if (!aulifyApiToken) {
        console.warn("[fetchDashboardData] Aulify token not found in localStorage. Calls to /aulify/* might fail.");
    }

    console.log(`[fetchDashboardData] Fetching all data for user ${currentUserId}...`);
    setLoadingRecent(true);
    setLoadingLeaderboard(true);
    setLoadingTimePlayed(true);
    setLoadingCoins(true);
    setLoadingSticker(true);
    setErrorRecent(null);
    setErrorLeaderboard(null);
    setErrorTimePlayed(null);
    setErrorCoins(null);
    setErrorSticker(null);

    // Headers for OUR backend endpoints (Stats, Leaderboard, Time)
    const headersOurApi = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ourToken}` // Use our JWT
    };
    
    // Headers for backend PROXY endpoints (Coins, Sticker)
    // Include our JWT for auth AND Aulify token in custom header for proxy
    const headersProxyApi = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ourToken}`, // Our JWT to authenticate with our backend
      'X-Aulify-Token': aulifyApiToken || '' // Aulify's token for the backend to use
    };

    try {
      const results = await Promise.allSettled([
          fetch(`http://localhost:3000/estadistica/ultimas-partidas`, { method: 'GET', headers: headersOurApi }), 
          fetch('http://localhost:3000/estadistica/leaderboard', { method: 'GET', headers: headersOurApi }),
          fetch(`http://localhost:3000/estadistica/tiempo-jugado`, { method: 'GET', headers: headersOurApi }), 
          fetch('http://localhost:3000/aulify/coins', { method: 'GET', headers: headersProxyApi }), // Use proxy headers
          fetch('http://localhost:3000/aulify/last-sticker', { method: 'GET', headers: headersProxyApi }) // Use proxy headers
      ]);
      console.log("[fetchDashboardData] All fetches completed.");

      // Process results (simplified - assumes same processing as before)
      // Recent Games
      const recentResult = results[0];
      if (recentResult.status === 'fulfilled' && recentResult.value.ok) {
          setRecentGamesData(await recentResult.value.json());
      } else {
          const status = recentResult.status === 'fulfilled' ? recentResult.value.status : 'rejected';
          const errorText = recentResult.status === 'rejected' ? recentResult.reason : await recentResult.value.text();
          setErrorRecent(`Failed (${status})`);
          console.error("Error fetching recent games:", errorText);
      }
      // Leaderboard
      const leaderboardResult = results[1];
       if (leaderboardResult.status === 'fulfilled' && leaderboardResult.value.ok) {
          setLeaderboardData(await leaderboardResult.value.json());
      } else {
           const status = leaderboardResult.status === 'fulfilled' ? leaderboardResult.value.status : 'rejected';
          const errorText = leaderboardResult.status === 'rejected' ? leaderboardResult.reason : await leaderboardResult.value.text();
          setErrorLeaderboard(`Failed (${status})`);
          console.error("Error fetching leaderboard:", errorText);
      }
      // Time Played
      const timePlayedResult = results[2];
       if (timePlayedResult.status === 'fulfilled' && timePlayedResult.value.ok) {
          const data = await timePlayedResult.value.json();
          // Keep totalSeconds, parse it to number, and handle date safely
          const transformedData = data.map(item => {
              let dayLabel = 'Err'; // Default label in case of error
              console.log("[fetchDashboardData] Raw date from backend:", item.date); // Log the raw date value
              // Ensure item.date exists before trying to parse
              if (item.date) { 
                  try {
                      // Try parsing the date directly
                      const dateObj = new Date(item.date);
                      if (!isNaN(dateObj.getTime())) { // Check if date is valid
                          dayLabel = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
                      } else {
                          console.warn('[fetchDashboardData] Invalid date parsed from:', item.date);
                      }
                  } catch (e) {
                      console.error('[fetchDashboardData] Error parsing date:', item.date, e);
                  }
              } else {
                   console.warn('[fetchDashboardData] Invalid or missing date value from backend:', item.date);
              }
              return {
                  day: dayLabel,
                  // Parse totalSeconds to integer, default to 0 if invalid
                  totalSeconds: parseInt(item.totalSeconds, 10) || 0 
              };
          });
          // Log the data structure being passed to the chart
          console.log("[fetchDashboardData] Time Played Chart Data:", transformedData); 
          setTimePlayedChartData(transformedData);
      } else {
           const status = timePlayedResult.status === 'fulfilled' ? timePlayedResult.value.status : 'rejected';
          const errorText = timePlayedResult.status === 'rejected' ? timePlayedResult.reason : await timePlayedResult.value.text();
          setErrorTimePlayed(`Failed (${status})`);
          console.error("Error fetching time played:", errorText);
      }

      // Coins
      const coinsResult = results[3];
      if (coinsResult.status === 'fulfilled' && coinsResult.value.ok) {
          setCoinsData(await coinsResult.value.json());
      } else {
          const status = coinsResult.status === 'fulfilled' ? coinsResult.value.status : 'rejected';
          const errorText = coinsResult.status === 'rejected' ? coinsResult.reason : await coinsResult.value.text();
          setErrorCoins(`Failed (${status})`);
          console.error("Error fetching coins:", errorText);
      }

      // Last Sticker
      const stickerResult = results[4];
      if (stickerResult.status === 'fulfilled' && stickerResult.value.ok) {
          setStickerData(await stickerResult.value.json());
      } else {
           const status = stickerResult.status === 'fulfilled' ? stickerResult.value.status : 'rejected';
           const errorText = stickerResult.status === 'rejected' ? stickerResult.reason : await stickerResult.value.text();
          setErrorSticker(`Failed (${status})`);
          console.error("Error fetching last sticker:", errorText);
      }

    } catch (error) {
      console.error("[fetchDashboardData] Unexpected error during fetch:", error);
      // Set generic error for all if a fundamental fetch issue occurs
      const genericError = 'Fetch error';
      setErrorRecent(prev => prev || genericError);
      setErrorLeaderboard(prev => prev || genericError);
      setErrorTimePlayed(prev => prev || genericError);
      setErrorCoins(prev => prev || genericError);
      setErrorSticker(prev => prev || genericError);
    } finally {
      console.log("[fetchDashboardData] Setting loading states to false.");
      setLoadingRecent(false);
      setLoadingLeaderboard(false);
      setLoadingTimePlayed(false);
      setLoadingCoins(false);
      setLoadingSticker(false);
    }
  }, [userInfo]); // Depends on userInfo to get the correct ID
  // --- End Refactored Fetch Logic ---

  // --- Effect 1: Get User Info and Token on Mount ---
  useEffect(() => {
    console.log("[Effect 1] Running: Reading localStorage...");
    const storedUserData = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('aulifyToken');

    if (storedUserData) {
        try {
            const parsedData = JSON.parse(storedUserData);
            if (parsedData && parsedData.id && parsedData.nivel !== undefined && parsedData.progreso !== undefined && parsedData.gamertag) {
                console.log("[Effect 1] User data FOUND, setting state:", parsedData);
                setUserInfo(parsedData);
                hasFetchedData.current = false; // Reset fetch flag when user data is loaded/changed
            } else {
                console.error("[Effect 1] Parsed user data invalid/missing fields:", parsedData);
                setUserInfo(null); // Ensure userInfo is null if data is bad
                hasFetchedData.current = false;
                setErrorRecent("Invalid user data in storage.");
                setErrorLeaderboard("Invalid user data in storage.");
                setErrorTimePlayed("Invalid user data in storage.");
                setErrorCoins("Invalid user data in storage.");
                setErrorSticker("Invalid user data in storage.");
                setLoadingRecent(false); // Stop loading if data is bad
                setLoadingLeaderboard(false);
                setLoadingTimePlayed(false);
                setLoadingCoins(false);
                setLoadingSticker(false);
            }
        } catch (e) {
             console.error("[Effect 1] Failed to parse user data", e);
             setUserInfo(null); // Ensure userInfo is null on error
             hasFetchedData.current = false;
             const corruptError = "Corrupt user data found.";
             setErrorRecent(corruptError);
             setErrorLeaderboard(corruptError);
             setErrorTimePlayed(corruptError);
             setErrorCoins(corruptError);
             setErrorSticker(corruptError);
             setLoadingRecent(false); // Stop loading on parse error
             setLoadingLeaderboard(false);
             setLoadingTimePlayed(false);
             setLoadingCoins(false);
             setLoadingSticker(false);
        }
    } else {
        console.warn("[Effect 1] User data NOT found in localStorage.");
        setUserInfo(null); // Ensure userInfo is null if not found
        hasFetchedData.current = false;
        const notFoundError = "User data not found. Please login again.";
        setErrorRecent(notFoundError);
        setErrorLeaderboard(notFoundError);
        setErrorTimePlayed(notFoundError);
        setErrorCoins(notFoundError);
        setErrorSticker(notFoundError);
        setLoadingRecent(false); // Stop loading if no user data
        setLoadingLeaderboard(false);
        setLoadingTimePlayed(false);
        setLoadingCoins(false);
        setLoadingSticker(false);
    }
    
    if (!storedToken) {
         console.warn("[Effect 1] Aulify token NOT found in localStorage.");
         // Set error only if another error isn't already present
         const tokenMissingError = "Auth token is missing.";
         setErrorRecent(prev => prev || tokenMissingError);
         setErrorLeaderboard(prev => prev || tokenMissingError);
         setErrorTimePlayed(prev => prev || tokenMissingError);
         setErrorCoins(prev => prev || tokenMissingError);
         setErrorSticker(prev => prev || tokenMissingError);
         setLoadingRecent(false); // Also stop loading if token is missing
         setLoadingLeaderboard(false);
         setLoadingTimePlayed(false);
         setLoadingCoins(false);
         setLoadingSticker(false);
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

  // --- Effect 3: Initial Data Fetch (depends on fetchDashboardData) ---
  useEffect(() => {
    // Fetch data ONLY if userInfo is loaded and we haven't fetched yet
    if (userInfo && !hasFetchedData.current) {
        console.log("[Effect 3] User info loaded, performing initial fetch...");
        fetchDashboardData();
        hasFetchedData.current = true; // Mark initial fetch as done
    }
  }, [userInfo, fetchDashboardData]); // Depend on userInfo and the fetch function itself

  // --- NEW Effect 4: Re-fetch data on Window Focus ---
  useEffect(() => {
    const handleFocus = () => {
        console.log("[Focus Handler] Window focused. Re-fetching data...");
        // Reset the flag ONLY if user info is present
        // We don't reset it if the user logs out and logs back in (Effect 1 handles that)
        if(userInfo) {
            // No need to reset hasFetchedData.current here, just trigger the fetch
            fetchDashboardData(); // Trigger data fetch
        }
    };

    console.log("[Effect 4] Adding window focus listener.");
    window.addEventListener('focus', handleFocus);

    // Cleanup listener on component unmount
    return () => {
        console.log("[Effect 4] Removing window focus listener.");
        window.removeEventListener('focus', handleFocus);
    };
    // Pass fetchDashboardData and userInfo in dependency array
    // to ensure handleFocus uses the latest versions
  }, [fetchDashboardData, userInfo]);
  // --- End NEW Effect 4 ---

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
            <div className="mb-3 pb-3 border-b ${darkMode ? 'border-gray-700/50' : 'border-white/30'}">
              <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-1 relative">
                  {/* Yellow circle background */}
                <div className={`w-full h-full ${darkMode ? 'bg-primary-yellow/40' : 'bg-primary-yellow/60'} rounded-full absolute backdrop-blur-sm ${darkMode ? 'border border-gray-700/50' : 'border border-white/30'}`}></div>
                {/* Avatar */}
                <div className="w-full h-full flex items-center justify-center relative">
                  <span className="text-3xl">🐭</span>
                </div>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bienvenido,</p>
                  <p className="font-bold text-lg mt-0">{userInfo ? userInfo.gamertag : 'Usuario'}</p>
                </div>
              </div>
            </div>

            {/* --- NEW: Coins Display --- */}
            <div className="py-3 border-b ${darkMode ? 'border-gray-700/50' : 'border-white/30'}">
              <div className="flex items-center justify-center space-x-2">
                <Coins className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                {loadingCoins ? (
                  <span className="text-xs text-gray-500">Cargando...</span>
                ) : errorCoins ? (
                   <span className="text-xs text-red-500" title={errorCoins}>Error</span>
                ) : (
                  <span className={`font-semibold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {coinsData?.coins ?? '--'}
                  </span>
                )}
                 <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monedas</span>
              </div>
            </div>
            {/* --- End Coins Display --- */}

             {/* --- NEW: Last Sticker Display --- */}
            <div className="py-3">
               <h3 className={`text-xs font-semibold uppercase text-center mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Último Sticker</h3>
               {loadingSticker ? (
                 <p className="text-xs text-center text-gray-500">Cargando sticker...</p>
               ) : errorSticker ? (
                 <p className="text-xs text-center text-red-500" title={errorSticker}>Error al cargar sticker.</p>
               ) : stickerData?.sticker ? (
                 <div className="flex flex-col items-center text-center space-y-1">
                   <img
                     src={stickerData.sticker.image}
                     alt={stickerData.sticker.name}
                     className={`w-16 h-16 object-contain rounded-lg p-1 ${darkMode ? 'bg-black/20' : 'bg-white/40'}`}
                     onError={(e) => { e.target.style.display='none'; }}
                   />
                   <p className={`text-sm font-semibold ${darkMode ? 'text-primary-yellow' : 'text-blue-700'}`}>{stickerData.sticker.name}</p>
                   <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stickerData.sticker.description}</p>
                 </div>
               ) : (
                 <p className="text-xs text-center text-gray-500 flex items-center justify-center space-x-1">
                   <Sparkles className="w-3 h-3" />
                   <span>¡Sigue jugando para conseguir stickers!</span>
                 </p>
               )}
             </div>
             {/* --- End Last Sticker Display --- */}

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
                          {/* Display total victorias instead of time */}
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                             {entry.victorias} Victorias 
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
                          {/* Use tickFormatter for Y-axis labels */}
                          <YAxis 
                            stroke={darkMode ? '#999' : '#666'} 
                            tick={{ fontSize: 12 }} 
                            label={{ value: 'Tiempo', angle: -90, position: 'insideLeft', fill: darkMode ? '#999' : '#666', fontSize: 12, dx: -5 }} 
                            tickFormatter={formatDurationForChart} // Apply formatting to ticks
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: darkMode ? '#333' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
                            itemStyle={{ color: darkMode ? '#ddd' : '#333' }} 
                            labelStyle={{ fontWeight: 'bold', color: darkMode ? '#fff' : '#000' }} 
                            // Use the new formatter for tooltip content (value is totalSeconds)
                            formatter={(value) => [formatDurationForChart(value), 'Tiempo']} 
                          />
                          {/* Use totalSeconds as dataKey */}
                          <Line type="monotone" dataKey="totalSeconds" stroke={darkMode ? '#F6BA27' : '#0053B1'} strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-gray-500">No hay datos de tiempo jugado para los últimos 7 días.</p>
                    )
                  }
            </div>
            
                {/* --- Level & Progress Card - VISUAL UPGRADE --- */}
                <div className={`md:col-span-2 p-6 rounded-2xl ${ 
              darkMode 
                    ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg' 
                    : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'
                }`}>
                  <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Nivel y Progreso</h2>
                  {
                    (userInfo && userInfo.nivel !== undefined && userInfo.progreso !== undefined) ? (
                      // Use Flexbox for layout: Badge on left, progress bar + text on right
                      <div className="flex items-center space-x-4">
                        {/* Level Badge */}
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-primary-yellow/20 border border-primary-yellow/50' : 'bg-blue-100 border border-blue-300'}`}>
                          <span className={`font-bold text-2xl ${darkMode ? 'text-primary-yellow' : 'text-blue-700'}`}>{userInfo.nivel}</span>
                  </div>

                        {/* Progress Bar and Text Container */}
                        <div className="flex-grow space-y-1">
                           <span className={`block text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Progreso al Nivel {userInfo.nivel + 1}</span>
                           {/* Progress Bar Container (for overlaying text) */}
                           <div className="relative w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden">
                             {/* Progress Bar Fill (with gradient) */}
                             <div 
                               className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-yellow-400 to-primary-yellow dark:from-yellow-500 dark:to-yellow-400 shadow-inner"
                               style={{ width: `${userInfo.progreso}%` }}
                               role="progressbar"
                               aria-valuenow={userInfo.progreso}
                               aria-valuemin="0"
                               aria-valuemax="100"
                             >
              </div>
                             {/* Progress Text Overlay */}
                             <div className="absolute inset-0 flex items-center justify-end pr-3">
                                <span className={`text-[10px] font-bold ${userInfo.progreso > 50 ? 'text-gray-800' : (darkMode? 'text-gray-200' : 'text-gray-700') } mix-blend-difference`}>
                                   {userInfo.progreso} / 100 XP
                                </span>
            </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                       <p className="text-sm text-gray-500">Cargando información de nivel...</p>
                    )
                  }
                </div>
                {/* --- End Level & Progress Card --- */}

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