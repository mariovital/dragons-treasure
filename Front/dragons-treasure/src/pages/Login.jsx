import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Import your images
// Note: You'll need to add your actual image files to the assets/images directory
import blueCircleImg from '../assets/images/blue_circle.png';
import blueWaveImg from '../assets/images/blue_line.png';
import yellowDotsImg from '../assets/images/yellow_dots.png';
import yellowWaveImg from '../assets/images/yellow_line.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock authentication - will be replaced with actual auth later
    console.log('Login attempt with:', formData);
    // Redirect to dashboard would happen here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Login card with decorative elements positioned relative to it */}
      <div className="relative w-full max-w-md">
        {/* Blue circle with red outline - positioned at top left of card */}
        <img 
          src={blueCircleImg} 
          alt="" 
          className="absolute -left-24 -top-24 w-60 h-48 object-contain z-0" 
        />
        
        {/* Blue wavy line - positioned at right side of card */}
        <img 
          src={blueWaveImg} 
          alt="" 
          className="absolute -right-40 top-25 w-60 h-64 object-contain z-0" 
        />
        
        {/* Yellow dot pattern - positioned at bottom right of card */}
        <img 
          src={yellowDotsImg} 
          alt="" 
          className="absolute right-0 bottom-0 w-36 h-36 object-contain z-0" 
        />
        
        {/* Yellow wavy line - positioned at bottom left of card */}
        <img 
          src={yellowWaveImg} 
          alt="" 
          className="absolute -left-16 bottom-0 w-24 h-48 object-contain z-0" 
        />

        {/* Login card */}
        <div className="glass w-full p-8 z-10 relative">
          {/* Updated Login heading with yellow background and black dot */}
          <h1 className="text-3xl font-bold mb-12 text-center relative inline-block w-full">
            <span className="relative z-10">Login</span>
            <span className="text-black">.</span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-primary-yellow h-4 w-32 -z-0 opacity-50 rounded-sm"></span>
          </h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Correo/Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="input"
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
                <a href="#" className="text-primary-yellow text-sm hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="input pr-10"
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
            
            <div className="flex items-center mb-8">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm">
                Recuérdame
              </label>
            </div>
            
            <button
              type="submit"
              className="button-primary w-full py-3 mb-6"
            >
              Login
            </button>
          </form>
          
          <div className="text-center">
            <span className="text-sm">¿Eres Nuevo? </span>
            <a href="#" className="text-sm font-medium text-gray-900 hover:underline">
              Crear una Cuenta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;