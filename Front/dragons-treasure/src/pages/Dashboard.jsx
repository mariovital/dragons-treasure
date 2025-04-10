import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Importamos los mismos assets que usamos en Login
import blueCircleImg from '../assets/images/blue_circle.png';
import blueWaveImg from '../assets/images/blue_line.png';
import yellowDotsImg from '../assets/images/yellow_dots.png';
import yellowWaveImg from '../assets/images/yellow_line.png';
import aulifyLogo from '../assets/images/Aulify_Logo.png';
import aulifyLogoWhite from '../assets/images/Aulify_Logo_White.png';
// Importamos los íconos para la navegación
import dashboardIcon from '../assets/images/Dashboard_Logo.png';
import estadisticasIcon from '../assets/images/Estadisticas_Logo.png';
import configuracionIcon from '../assets/images/Configuracion_Logo.png';
import darkModeIcon from '../assets/images/DarkMode_Logo.png';
import salirIcon from '../assets/images/Salir_Logo.png';

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
    <div className={`h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} relative overflow-hidden`}>
      {/* Contenedor para elementos decorativos de fondo - reposicionados según el mockup */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Franja superior con elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-32 flex items-center justify-between px-4 z-0">
          <img 
            src={yellowWaveImg} 
            alt="" 
            className="w-16 h-16 object-contain opacity-80 transform -rotate-45" 
          />
          <img 
            src={blueWaveImg} 
            alt="" 
            className="w-24 h-24 object-contain opacity-80" 
          />
          <img 
            src={yellowDotsImg} 
            alt="" 
            className="w-20 h-20 object-contain opacity-80" 
          />
          <img 
            src={blueCircleImg} 
            alt="" 
            className="w-32 h-32 object-contain opacity-80" 
          />
        </div>
        
        {/* Elementos decorativos adicionales distribuidos */}
        <img 
          src={yellowDotsImg} 
          alt="" 
          className="absolute top-20 right-1/4 w-24 h-24 object-contain opacity-70" 
        />
        <img 
          src={blueCircleImg} 
          alt="" 
          className="absolute top-40 right-10 w-40 h-40 object-contain opacity-60" 
        />
        <img 
          src={yellowWaveImg} 
          alt="" 
          className="absolute bottom-20 left-1/3 w-32 h-32 object-contain opacity-70 transform rotate-90" 
        />
      </div>
      
      {/* Sidebar - estilo actualizado para parecerse más al mockup de Figma */}
      <div className={`w-64 ${darkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white shadow-md'} p-6 flex flex-col z-10 relative rounded-3xl mx-4 my-4`}>
        {/* Logo - usando la imagen agregada */}
        <div className="mb-8 flex justify-center">
          <div className="h-10 w-24 flex items-center justify-center">
            <img 
              src={darkMode ? aulifyLogoWhite : aulifyLogo} 
              alt="Aulify" 
              className="h-full object-contain" 
            />
          </div>
        </div>

        {/* User welcome section - ajustado para parecerse al mockup */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-2 relative">
            {/* Círculo amarillo de fondo */}
            <div className="w-full h-full bg-primary-yellow rounded-full absolute"></div>
            {/* Avatar del ratón con queso como en el mockup */}
            <div className="w-full h-full flex items-center justify-center relative">
              <span className="text-2xl">🐭</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">Bienvenido,</p>
            <p className="font-bold text-lg font-mono">Usuario</p>
          </div>
        </div>

        {/* Navigation - ajustado para parecerse al mockup */}
        <nav className="flex-1">
          <ul className="space-y-8">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center w-full p-2 transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'font-bold' 
                    : 'font-normal'
                }`}
              >
                <span className="mr-3 w-6 h-6 flex items-center justify-center">
                  <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />
                </span>
                <span className="text-lg font-mono">Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('statistics')}
                className={`flex items-center w-full p-2 transition-colors ${
                  activeTab === 'statistics' 
                    ? 'font-bold' 
                    : 'font-normal'
                }`}
              >
                <span className="mr-3 w-6 h-6 flex items-center justify-center">
                  <img src={estadisticasIcon} alt="Estadísticas" className="w-5 h-5" />
                </span>
                <span className="text-lg font-mono">Estadísticas</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('configuration')}
                className={`flex items-center w-full p-2 transition-colors ${
                  activeTab === 'configuration' 
                    ? 'font-bold' 
                    : 'font-normal'
                }`}
              >
                <span className="mr-3 w-6 h-6 flex items-center justify-center">
                  <img src={configuracionIcon} alt="Configuración" className="w-5 h-5" />
                </span>
                <span className="text-lg font-mono">Configuración</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom actions - ajustado para parecerse al mockup */}
        <div className="mt-auto pt-6">
          <button 
            onClick={toggleDarkMode}
            className="flex items-center w-full p-2 rounded-lg mb-6"
          >
            <span className="mr-3 w-6 h-6 flex items-center justify-center">
              <img src={darkModeIcon} alt="Dark Mode" className="w-5 h-5" />
            </span>
            <span className="text-lg font-mono">Dark Mode</span>
          </button>
          <button 
            className="flex items-center w-full p-2 rounded-lg text-red-500"
          >
            <span className="mr-3 w-6 h-6 flex items-center justify-center">
              <img src={salirIcon} alt="Salir" className="w-5 h-5" />
            </span>
            <span className="text-lg font-mono">Salir</span>
          </button>
        </div>

        {/* ... resto del sidebar ... */}
      </div>

      {/* Main content - ajustado para parecerse más al mockup */}
      <div className="flex-1 p-6 z-10 overflow-auto pt-16">
        <h2 className="text-2xl font-bold mb-8 ml-4 font-mono">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-4 max-w-screen-xl">
          {/* User Level Widget - estilizado como en el mockup */}
          <div className={`${darkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white'} p-8 rounded-3xl shadow-md`}>
            <h3 className="text-xl font-bold mb-6 font-mono text-center">Nivel</h3>
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className="flex items-center">
                <span className="text-3xl font-bold mr-3 font-mono">1</span>
                <span className="text-xl bg-black text-white rounded-full w-8 h-8 flex items-center justify-center">★</span>
              </div>
              <span className="text-2xl font-mono">→</span>
              <div className="flex items-center">
                <span className="text-3xl font-bold mr-3 font-mono">2</span>
                <span className="text-xl bg-black text-white rounded-full w-8 h-8 flex items-center justify-center">★</span>
              </div>
            </div>
            <p className="text-center text-sm font-mono">5 puntos para subir</p>
          </div>

          {/* Time Stats Graph - ajustado para parecerse al mockup */}
          <div className={`${darkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white'} p-8 rounded-3xl shadow-md`}>
            <h3 className="text-xl font-bold mb-4 font-mono">Tiempo de Juego</h3>
            // Modificaciones para el gráfico de tiempo de juego
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    tick={{fontSize: 10}}
                    axisLine={{ stroke: '#E0E0E0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{fontSize: 10}} 
                    axisLine={{ stroke: '#E0E0E0' }}
                    tickLine={false}
                    domain={[0, 7]}
                    ticks={[0, 1, 3, 5, 7]} // Valores específicos del mockup
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#FF0000" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: "#000000", strokeWidth: 0 }} 
                    activeDot={{ r: 6 }} 
                    isAnimationActive={true} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Games Widget - ajustado según el diseño de Figma */}
          <div className={`${darkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white'} p-8 rounded-3xl shadow-md transition-all duration-300 hover:shadow-lg`}>
            <h3 className="text-xl font-bold mb-6 font-mono text-center">Últimas 5 partidas.</h3>
            <ul className="space-y-5">
              {recentGames.map((game, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-xl">{game.status}</span>
                  <span className="text-xl font-mono">{game.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Leaderboard Widget - ajustado según el diseño de Figma */}
          <div className={`${darkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white'} p-8 rounded-3xl shadow-md`}>
            <h3 className="text-xl font-bold mb-6 font-mono text-center">Leaderboard</h3>
            <ul className="space-y-5">
              {leaderboardData.map((player, index) => (
                <li key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="mr-3 text-xl">{player.medal}</span>
                    <span className="text-xl font-mono">{player.time}</span>
                  </div>
                  <span className="font-medium text-lg">{player.name}</span>
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