import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="w-full min-h-screen">
        <Login />
      </div>
    </ThemeProvider>
  );
}

export default App;