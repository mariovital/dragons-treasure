import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Import your images with corrected folder name
import blueCircleImg from '../assets/images 2/blue_circle.png';
import blueWaveImg from '../assets/images 2/blue_line.png';
import yellowDotsImg from '../assets/images 2/yellow_dots.png';
import yellowWaveImg from '../assets/images 2/yellow_line.png';
import aulifyLogo from '../assets/images 2/Aulify_Logo.png';
import aulifyLogoWhite from '../assets/images 2/Aulify_Logo_White.png';

// Import ParticlesBackground
import ParticlesBackground from '../components/ParticlesBackground';
import useMousePosition from '../hooks/useMousePosition';

// Import CrosstenLight font
import '../fonts/CrosstenLight.css';

// Import the WarpSpeedButton component
import WarpSpeedButton from '../components/WarpSpeedButton';

// Import AnimatedModeToggle component
import AnimatedModeToggle from '../components/AnimatedModeToggle';

const Login = () => {
  const { darkMode, isTransitioning, transitionDirection } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '', // This will be sent as 'email'
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(''); // Add error state
  const navigate = useNavigate(); // Initialize navigate

  const containerRef = useRef(null);
  const mousePosition = useMousePosition();
  const [containerBounds, setContainerBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Update container bounds when component mounts - Fixed with useEffect
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerBounds({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerBounds({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    // Initial call to set bounds
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate relative mouse position
  const relativeX = mousePosition.x - containerBounds.x;
  const relativeY = mousePosition.y - containerBounds.y;
  
  // Calculate movement factors (between -1 and 1)
  const moveFactorX = containerBounds.width > 0 ? (relativeX / containerBounds.width) * 3 - 1 : 0;
  const moveFactorY = containerBounds.height > 0 ? (relativeY / containerBounds.height) * 3 - 1 : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // Llama a tu backend local
        const response = await fetch('https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com/aulifyLogin', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.username, password: formData.password }),
      });

        // Lee la respuesta JSON de TU backend
      const data = await response.json();

        // Verifica la propiedad 'success' de la respuesta de tu backend
        if (data.success) { 
            // Login exitoso
            console.log('Local backend login successful:', data);

            // *** Almacenar Token JWT (nuestro) y Token de Aulify ***
            localStorage.setItem('token', data.token); // Guardar nuestro JWT
            if (data.aulifyToken) { // Guardar token de Aulify si existe
                localStorage.setItem('aulifyToken', data.aulifyToken); 
                console.log('Aulify Token stored.');
            }
            localStorage.setItem('userData', JSON.stringify(data.user));

            // Redirigir al dashboard
        navigate('/dashboard');

      } else {
            // Login fallido (tu backend reenvió el error de Aulify o tuvo un error propio)
            console.error('Local backend login failed:', data);
            // Usa el mensaje de error de la respuesta de tu backend
            setError(data.message || 'Login failed. Please check your credentials.'); 
      }
    } catch (err) {
        // ... manejo de error de red ...
      console.error('Network or other error during login:', err);
      setError('Login failed due to a network error. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'text-white' : 'text-gray-800'} relative overflow-hidden w-full font-crossten transition-colors duration-300`}>
      {/* Gradient background with organic circular feel */}
      <div className="fixed inset-0 overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-300 ${
          darkMode 
            ? 'bg-[#0F0C1D]' 
            : 'bg-white'
        }`}></div>
        
        {/* Organic circular gradient overlays with transitions */}
        <div className={`absolute w-[80%] h-[80%] rounded-full blur-[80px] -top-[5%] -left-[5%] transition-colors duration-300 ${
          darkMode ? 'bg-[#331A1D]/70' : 'bg-[#F6BA27]/30'
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
      
      {/* Theme transition radial overlay */}
      {isTransitioning && (
        <div 
          className={`fixed inset-0 z-[100] pointer-events-none ${
            transitionDirection === 'to-dark' 
              ? 'bg-[#0F0C1D]' 
              : 'bg-white'
          }`}
          style={{
            animationName: 'radialExpand',
            animationDuration: '800ms',
            animationTimingFunction: 'ease-in-out',
            animationFillMode: 'forwards'
          }}
        />
      )}
      
      {/* Add the particles background */}
      <ParticlesBackground />
      
      {/* Login card with decorative elements positioned relative to it */}
      <div ref={containerRef} className="relative w-full max-w-md">
        {/* Decorative elements... */}
        {/* Blue circle with red outline - positioned at top left of card */}
        <img 
          src={blueCircleImg} 
          alt="" 
          className="absolute -left-24 -top-24 w-60 h-48 object-contain z-0 transition-transform duration-300 ease-out" 
          style={{ 
            transform: `translate(${moveFactorX * 10}px, ${moveFactorY * 10}px) rotate(${moveFactorX * 5}deg)` 
          }}
        />
        
        {/* Blue wavy line - positioned at right side of card */}
        <img 
          src={blueWaveImg} 
          alt="" 
          className="absolute -right-40 top-25 w-60 h-64 object-contain z-0 transition-transform duration-300 ease-out" 
          style={{ 
            transform: `translate(${-moveFactorX * 15}px, ${moveFactorY * 8}px) rotate(${-moveFactorX * 3}deg)` 
          }}
        />
        
        {/* Yellow dot pattern - adjusted positioning and size */}
        <img 
          src={yellowDotsImg} 
          alt="" 
          className="absolute -right-16 bottom-0 w-48 h-48 object-contain z-0 translate-x-1/4 translate-y-1/4 transition-transform duration-300 ease-out" 
          style={{ 
            transform: `translate(${-moveFactorX * 12}px, ${-moveFactorY * 12}px)` 
          }}
        />
        
        {/* Yellow wavy line - increased size and adjusted position to match Figma */}
        <img 
          src={yellowWaveImg} 
          alt="" 
          className="absolute -left-28 bottom-16 w-48 h-48 object-contain z-0 transition-transform duration-300 ease-out"
          style={{ 
            transform: `rotate(30deg) translate(${moveFactorX * 15}px, ${-moveFactorY * 10}px)` 
          }}
        />

        {/* Login card with improved transitions */}
        <div 
          className={`w-full p-8 z-10 relative rounded-xl backdrop-blur-md transition-all duration-500 ease-in-out overflow-hidden ${
            darkMode 
              ? 'bg-[#0F0C1D]/80 border-0' 
              : 'bg-white/50 border border-white/30 shadow-lg'
          } ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-containerPop'}`}
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transitionDelay: isTransitioning ? '0s' : '0.6s'
          }}
        >
          {/* Logo above login heading */}
          <div className="flex justify-center mb-8">
            <img 
              src={darkMode ? aulifyLogoWhite : aulifyLogo} 
              alt="Aulify Logo" 
              className="h-20 object-contain transition-all duration-300 ease-in-out" 
            />
          </div>
          
          {/* Updated Login heading with yellow background and black dot */}
          <h1 className="text-3xl font-bold mb-12 text-center relative inline-block w-full">
            <span className="relative z-10">Login</span>
            <span className={darkMode ? "text-white" : "text-black"}>.</span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-primary-yellow h-4 w-32 -z-0 opacity-50 rounded-sm"></span>
          </h1>
          
          {/* Display Error Message Inside Card, Before Inputs/Button - IMPROVED VISIBILITY */}
          {error && (
            <div className="mb-4 text-center text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg border border-red-400 dark:border-red-600/50 shadow-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Correo/Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className={`input ${darkMode ? 'bg-gray-700/50 border-gray-600' : ''}`}
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium">
                  Contraseña
                </label>
                <a href="https://www.aulify.mx/password/new" target="_blank" rel="noopener noreferrer" className="text-primary-yellow text-sm hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`input pr-10 ${darkMode ? 'bg-gray-700/50 border-gray-600' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Replace the regular button with the WarpSpeedButton */}
            <WarpSpeedButton
              type="submit"
              className="mb-6"
            >
              Login
            </WarpSpeedButton>
          </form>
          
          <div className="text-center mb-4">
            <span className="text-sm">¿Eres Nuevo? </span>
            <a href="https://www.aulify.mx/sign_up" target="_blank" rel="noopener noreferrer" className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} hover:underline`}>
              <strong>Crear una Cuenta</strong>
            </a>
          </div>
          
          {/* Replace the Dark Mode Toggle Button with AnimatedModeToggle */}
          <div className="flex justify-center mt-4">
            <AnimatedModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
