import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Import decorative components
import BlueCircle from '../components/BlueCircle.';
import YellowWave from '../components/YellowWave';
import DotPattern from '../components/DotPattern';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (formData.username === 'test@example.com' && formData.password === 'password') {
        // Redirect to dashboard (will be handled by router later)
        window.location.href = '/dashboard';
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // The return statement should be inside the Login component function
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -left-20 -top-20 z-0">
        <BlueCircle />
      </div>
      <div className="absolute right-0 top-1/4 z-0">
        <YellowWave />
      </div>
      <div className="absolute right-10 bottom-10 z-0">
        <DotPattern />
      </div>

      {/* Login card */}
      <div className="glass w-full max-w-md p-8 z-10">
        <h1 className="text-3xl font-bold mb-8">Login<span className="text-primary-yellow">.</span></h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
          
          <div className="mb-6">
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
          
          <div className="flex items-center mb-6">
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
            className="button-primary w-full flex justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-sm">¿Eres Nuevo? </span>
          <a href="#" className="text-sm font-medium text-gray-900 dark:text-white hover:underline">
            Crear una Cuenta
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;