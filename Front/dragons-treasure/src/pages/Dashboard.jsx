
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import TopAssetBar from '../components/dashboard/TopAssetBar';

// Import decorative assets for additional elements
import blueCircleImg from '../assets/images/blue_circle.png';
import blueWaveImg from '../assets/images/blue_line.png';
import yellowDotsImg from '../assets/images/yellow_dots.png';
import yellowWaveImg from '../assets/images/yellow_line.png';

// Import logo and navigation icons
import aulifyLogo from '../assets/images/Aulify_Logo.png';
import dashboardIcon from '../assets/images/Dashboard_Logo.png';
import estadisticasIcon from '../assets/images/Estadisticas_Logo.png';
import configuracionIcon from '../assets/images/Configuracion_Logo.png';
import darkModeIcon from '../assets/images/DarkMode_Logo.png';
import salirIcon from '../assets/images/Salir_Logo.png';

// Import chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="w-full bg-white text-gray-800 min-h-screen">
      {/* Decorative background with TopAssetBar */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-white">
        {/* TopAssetBar */}
        <div className="absolute top-0 left-0 w-full z-0">
          <TopAssetBar />
        </div>
        
        {/* Additional decorative elements */}
        <img src={yellowDotsImg} alt="" className="absolute top-32 right-1/4 w-24 h-24 object-contain opacity-70" />
        <img src={blueCircleImg} alt="" className="absolute top-40 right-10 w-40 h-40 object-contain opacity-60" />
        <img src={yellowWaveImg} alt="" className="absolute bottom-20 left-1/3 w-32 h-32 object-contain opacity-70 transform rotate-90" />
        <img src={blueWaveImg} alt="" className="absolute top-60 left-20 w-36 h-36 object-contain opacity-70" />
      </div>
      
      {/* Main content wrapper - Using CSS Grid */}
      <div className="relative min-h-screen grid grid-cols-[290px_1fr] bg-transparent">
        {/* Sidebar - Always visible for desktop */}
        <div className="z-40">
          <div className="h-screen py-6 px-8 flex flex-col rounded-tr-3xl rounded-br-3xl glass">
            {/* Logo */}
            <div className="mb-10 flex justify-center">
              <div className="h-12 w-32 flex items-center justify-center">
                <img 
                  src={aulifyLogo} 
                  alt="Aulify" 
                  className="h-full object-contain" 
                />
              </div>
            </div>

            {/* User welcome section */}
            <div className="mb-14 flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-4 relative">
                {/* Yellow circle background */}
                <div className="w-full h-full bg-primary-yellow rounded-full absolute"></div>
                {/* Avatar */}
                <div className="w-full h-full flex items-center justify-center relative">
                  <span className="text-3xl">🐭</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-mono">Bienvenido,</p>
                <p className="font-bold text-xl font-mono mt-1">Usuario</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1">
              <ul className="space-y-10">
                <li>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                      activeTab === 'dashboard' 
                        ? 'font-bold bg-gray-100/60' 
                        : 'font-normal hover:bg-gray-100/40'
                    }`}
                  >
                    <span className="mr-4 w-8 h-8 flex items-center justify-center">
                      <img src={dashboardIcon} alt="Dashboard" className="w-6 h-6" />
                    </span>
                    <span className="text-lg font-mono">Dashboard</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('statistics')}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                      activeTab === 'statistics' 
                        ? 'font-bold bg-gray-100/60' 
                        : 'font-normal hover:bg-gray-100/40'
                    }`}
                  >
                    <span className="mr-4 w-8 h-8 flex items-center justify-center">
                      <img src={estadisticasIcon} alt="Estadísticas" className="w-6 h-6" />
                    </span>
                    <span className="text-lg font-mono">Estadísticas</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('configuration')}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                      activeTab === 'configuration' 
                        ? 'font-bold bg-gray-100/60' 
                        : 'font-normal hover:bg-gray-100/40'
                    }`}
                  >
                    <span className="mr-4 w-8 h-8 flex items-center justify-center">
                      <img src={configuracionIcon} alt="Configuración" className="w-6 h-6" />
                    </span>
                    <span className="text-lg font-mono">Configuración</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Bottom actions */}
            <div className="mt-auto pt-8 space-y-6">
              <button 
                onClick={toggleDarkMode}
                className="flex items-center w-full p-3 rounded-xl transition-all duration-200 hover:bg-gray-100/40"
              >
                <span className="mr-4 w-8 h-8 flex items-center justify-center">
                  <img src={darkModeIcon} alt="Dark Mode" className="w-6 h-6" />
                </span>
                <span className="text-lg font-mono">Dark Mode</span>
              </button>
              <button 
                className="flex items-center w-full p-3 rounded-xl text-red-500 transition-all duration-200 hover:bg-gray-100/40"
              >
                <span className="mr-4 w-8 h-8 flex items-center justify-center">
                  <img src={salirIcon} alt="Salir" className="w-6 h-6" />
                </span>
                <span className="text-lg font-mono">Salir</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="p-6 overflow-auto">
          <h1 className="text-3xl font-bold font-mono mb-8 mt-4">Dashboard</h1>
          
          {/* Dashboard content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Progress Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h2 className="text-2xl font-bold font-mono mb-6">Nivel</h2>
              <div className="flex items-center justify-center space-x-8">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold">1</span>
                  <div className="mt-2 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="text-xl">★</span>
                  </div>
                </div>
                
                <div className="text-3xl">→</div>
                
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold">2</span>
                  <div className="mt-2 bg-gray-300 text-gray-600 rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="text-xl">✪</span>
                  </div>
                </div>
              </div>
              <p className="text-center mt-6 text-sm font-mono">5 puntos para subir</p>
            </div>
            
            {/* Gameplay Time Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h2 className="text-2xl font-bold font-mono mb-6">Tiempo de Juego</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timePlayedData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#FF4D4D" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#FF4D4D" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Matches Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h2 className="text-2xl font-bold font-mono mb-6">Últimas 5 partidas.</h2>
              <div className="space-y-4">
                {recentGames.map((game, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-2xl">{game.medal}</span>
                    <span className="text-xl font-mono">{game.time}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Leaderboard */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h2 className="text-2xl font-bold font-mono mb-6">Leaderboard</h2>
              <div className="space-y-4">
                {leaderboardData.map((player, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{player.medal}</span>
                      <span className="text-xl font-mono">{player.time}</span>
                    </div>
                    <span className="text-xl font-mono">{player.name}</span>
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
