import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Importamos los mismos assets que usamos en Login
import blueCircleImg from '../assets/images/blue_circle.png';
import blueWaveImg from '../assets/images/blue_line.png';
import yellowDotsImg from '../assets/images/yellow_dots.png';
import yellowWaveImg from '../assets/images/yellow_line.png';

// Datos de ejemplo para el gráfico
const timeData = [
  { day: 'Lunes', hours: 1 },
  { day: 'Martes', hours: 2.5 },
  { day: 'Miércoles', hours: 1.2 },
  { day: 'Jueves', hours: 0.5 },
  { day: 'Viernes', hours: 5 },
  { day: 'Sábado', hours: 2.5 },
  { day: 'Domingo', hours: 7 },
];

// Datos de ejemplo para las últimas partidas
const recentGames = [
  { time: '1:44:10', status: '🏆' },
  { time: '2:30:22', status: '❌' },
  { time: '3:05:50', status: '❌' },
  { time: '1:50:20', status: '🥈' },
  { time: '2:00:40', status: '🥉' },
];

// Datos de ejemplo para el leaderboard
const leaderboardData = [
  { name: 'Luan', time: '1:44:10', medal: '🏆' },
  { name: 'Sofí', time: '1:44:10', medal: '🥈' },
  { name: 'Diana', time: '1:44:10', medal: '🥉' },
  { name: 'Santiago', time: '1:44:10', medal: '⚫' },
  { name: 'Hugo', time: '1:44:10', medal: '⚫' },
];

const Dashboard = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-black text-white' : 'bg-white text-gray-800'} relative overflow-hidden`}>
      {/* Contenedor para elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src={blueCircleImg} 
          alt="" 
          className="absolute top-0 right-10 w-60 h-48 object-contain opacity-70" 
        />
        <img 
          src={blueWaveImg} 
          alt="" 
          className="absolute bottom-40 right-20 w-60 h-64 object-contain opacity-70" 
        />
        <img 
          src={yellowDotsImg} 
          alt="" 
          className="absolute top-40 left-1/3 w-48 h-48 object-contain opacity-70" 
        />
        <img 
          src={yellowWaveImg} 
          alt="" 
          className="absolute bottom-20 left-20 w-48 h-48 object-contain opacity-70 transform rotate-45" 
        />
      </div>
      
      {/* Sidebar - reducido espaciado vertical */}
      <div className={`w-64 ${darkMode ? 'bg-gray-900/80 backdrop-blur-md' : 'glass'} p-4 flex flex-col z-10 relative`}>
        {/* Logo */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">
            aulify<span className="text-primary-yellow">.</span>
          </h1>
        </div>

        {/* User welcome section - reducido espaciado */}
        <div className="mb-6 flex items-center">
          <div className="w-10 h-10 mr-3">
            {/* Aquí irá la imagen del ratón con queso */}
            <div className="w-full h-full bg-primary-yellow rounded-full flex items-center justify-center">
              <span className="text-lg">🐭</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Bienvenido,</p>
            <p className="font-medium">Usuario</p>
          </div>
        </div>

        {/* Navigation - reducido espaciado entre items */}
        <nav className="flex-1">
          <ul className="space-y-3">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'font-bold' 
                    : 'font-normal'
                }`}
              >
                <span className="mr-3">⬛</span>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('statistics')}
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                  activeTab === 'statistics' 
                    ? 'font-bold' 
                    : 'font-normal'
                }`}
              >
                <span className="mr-3">📊</span>
                <span>Estadísticas</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('configuration')}
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                  activeTab === 'configuration' 
                    ? 'font-bold' 
                    : 'font-normal'
                }`}
              >
                <span className="mr-3">⚙️</span>
                <span>Configuración</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom actions - reducido espaciado */}
        <div className="mt-auto pt-3">
          <button 
            onClick={toggleDarkMode}
            className="flex items-center w-full p-2 rounded-lg mb-2"
          >
            <span className="mr-3">🌙</span>
            <span>Dark Mode</span>
          </button>
          <button 
            className="flex items-center w-full p-2 rounded-lg text-red-500"
          >
            <span className="mr-3">✕</span>
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Main content - reducido padding y espaciado */}
      <div className="flex-1 p-4 z-10 overflow-auto">
        <h2 className="text-2xl font-bold mb-4 ml-2">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2">
          {/* User Level Widget - reducido padding y espaciado */}
          <div className={`${darkMode ? 'bg-gray-900/80 backdrop-blur-md' : 'glass'} p-4 rounded-xl`}>
            <h3 className="text-xl font-bold mb-3">Nivel</h3>
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">1</span>
                <span className="text-xl">⭐</span>
              </div>
              <span className="text-xl">→</span>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">2</span>
                <span className="text-xl">✨</span>
              </div>
            </div>
            <p className="text-center text-sm">5 puntos para subir</p>
          </div>

          {/* Time Stats Graph - reducido altura */}
          <div className={`${darkMode ? 'bg-gray-900/80 backdrop-blur-md' : 'glass'} p-4 rounded-xl`}>
            <h3 className="text-xl font-bold mb-2">Tiempo de Juego</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#F59E0B" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }} 
                    isAnimationActive={true} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Games Widget - reducido espaciado */}
          <div className={`${darkMode ? 'bg-gray-900/80 backdrop-blur-md' : 'glass'} p-4 rounded-xl`}>
            <h3 className="text-xl font-bold mb-2">Últimas 5 partidas.</h3>
            <ul className="space-y-2">
              {recentGames.map((game, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-lg">{game.status}</span>
                  <span className="text-lg font-mono">{game.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Leaderboard Widget - reducido espaciado */}
          <div className={`${darkMode ? 'bg-gray-900/80 backdrop-blur-md' : 'glass'} p-4 rounded-xl`}>
            <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
            <ul className="space-y-2">
              {leaderboardData.map((player, index) => (
                <li key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="mr-2">{player.medal}</span>
                    <span className="text-lg">{player.time}</span>
                  </div>
                  <span className="font-medium">{player.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;