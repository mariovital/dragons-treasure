import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
      {/* Decorative elements - placeholders for your PNG assets */}
      <div className="absolute left-0 top-0">
        {/* Blue circle with red outline - you'll add this manually */}
        <div className="w-64 h-64"></div>
      </div>
      
      <div className="absolute right-0 top-1/4">
        {/* Blue wavy line - you'll add this manually */}
        <div className="w-32 h-64"></div>
      </div>
      
      <div className="absolute right-10 bottom-10">
        {/* Yellow dot pattern - you'll add this manually */}
        <div className="w-40 h-40"></div>
      </div>
      
      <div className="absolute left-10 bottom-10">
        {/* Yellow wavy line - you'll add this manually */}
        <div className="w-32 h-64"></div>
      </div>

      {/* Login card */}
      <div className="glass w-full max-w-md p-8 z-10">
        <h1 className="text-3xl font-bold mb-12 text-center">Login<span className="text-primary-yellow">.</span></h1>
        
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
  );
};

export default Login;