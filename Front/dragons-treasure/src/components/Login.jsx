
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import BlueCircle from '../assets/decorative/BlueCircle';
import YellowWave from '../assets/decorative/YellowWave';
import DotPattern from '../assets/decorative/DotPattern';

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
}  
