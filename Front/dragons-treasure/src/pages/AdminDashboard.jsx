import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart3, Trophy, Skull, ArrowLeft, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import ParticlesBackground component
import ParticlesBackground from '../components/ParticlesBackground';

// Definir URL Base de la API (importante que coincida con Dashboard/Login)
const API_BASE_URL = 'https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com'; 

// --- Helper para formatear números grandes (ej. 1000 -> 1k) ---
const formatNumber = (num) => {
  if (num === null || num === undefined) return '--';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

// --- NEW Helper function to format total duration (D h M) ---
const formatTotalDuration = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) { // Allow 0 seconds
    return '0min'; 
  }
  if (totalSeconds === 0) return '0min';
  
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  
  let parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  // Show minutes if > 0, or if it's the only unit, or if totalSeconds is less than an hour but not 0.
  if (minutes > 0 || parts.length === 0 || (totalSeconds > 0 && totalSeconds < 3600)) parts.push(`${minutes}min`);

  return parts.join(' ') || '0min'; // Ensure '0min' if parts is empty (e.g. totalSeconds was 0 and handled weirdly)
};
// --- End Helpers ---

const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // Estado para el resumen de la plataforma
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  // Estado para la lista de usuarios y paginación
  const [usersData, setUsersData] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0, limit: 10 });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);

  // --- NUEVOS ESTADOS PARA DETALLES DE USUARIO ---
  const [selectedUser, setSelectedUser] = useState(null); // Almacenará el objeto del usuario seleccionado
  const [userDetailData, setUserDetailData] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [errorUserDetails, setErrorUserDetails] = useState(null);
  // --- FIN NUEVOS ESTADOS ---

  // --- Función para obtener el resumen de la plataforma ---
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setErrorSummary(null);
    const token = localStorage.getItem('token'); // Nuestro token JWT
    if (!token) {
      setErrorSummary('No autenticado');
      setLoadingSummary(false);
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) navigate('/dashboard'); // Redirect if not admin
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      if (data.success) {
        setSummaryData(data.summary);
      } else {
        throw new Error(data.message || 'Error al cargar resumen');
      }
    } catch (err) {
      console.error("[Admin] Error fetching summary:", err);
      setErrorSummary(err.message);
    } finally {
      setLoadingSummary(false);
    }
  }, [navigate]);

  // --- Función para obtener la lista de usuarios (paginada) ---
  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    setLoadingUsers(true);
    setErrorUsers(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorUsers('No autenticado');
      setLoadingUsers(false);
      // navigate('/login'); // Already handled by fetchSummary or main auth check
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
         if (response.status === 401 || response.status === 403) navigate('/dashboard'); // Redirect if not admin
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      if (data.success) {
        setUsersData(data.users);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error("[Admin] Error fetching users:", err);
      setErrorUsers(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [navigate]);

  // --- NUEVA FUNCIÓN PARA OBTENER DETALLES DEL USUARIO ---
  const fetchUserDetails = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingUserDetails(true);
    setErrorUserDetails(null);
    setUserDetailData(null); // Limpiar datos previos
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorUserDetails('No autenticado');
      setLoadingUserDetails(false);
      navigate('/login');
      return;
    }

    try {
      console.log(`[Admin] Fetching details for user ID: ${userId}`);
      const response = await fetch(`${API_BASE_URL}/admin/user-stats/${userId}`, { // <-- LLAMADA REAL AL BACKEND
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            navigate('/dashboard'); // O a /login si es un 401 general
            throw new Error('Acceso denegado o no autorizado.');
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText })); // Intenta parsear JSON, sino usa statusText
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.summary) { // Asumiendo que el backend devuelve { success: true, summary: { ... } }
        setUserDetailData(data.summary);
      } else {
        throw new Error(data.message || 'Error al cargar detalles del usuario: Formato de respuesta inesperado.');
      }

    } catch (err) {
      console.error("[Admin] Error fetching user details:", err);
      setErrorUserDetails(err.message);
    } finally {
      setLoadingUserDetails(false);
    }
  }, [navigate]); 
  // --- FIN NUEVA FUNCIÓN ---

  const handleUserRowClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetailData(null);
    setErrorUserDetails(null);
  };

  // --- Efecto para cargar datos iniciales ---
  useEffect(() => {
    // Basic auth check before fetching anything
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    if (userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchSummary();
    fetchUsers(); // Cargar primera página de usuarios
  }, [fetchSummary, fetchUsers, navigate]);


  // --- Manejadores de paginación ---
  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      fetchUsers(pagination.currentPage - 1, pagination.limit);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchUsers(pagination.currentPage + 1, pagination.limit);
    }
  };

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'text-white' : 'text-gray-800'} font-crossten relative overflow-hidden`}>
      {/* Gradient background from Dashboard.jsx */}
      <div className="fixed inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-[#0F0C1D]' 
            : 'bg-white'
        }`}></div>
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
      
      <ParticlesBackground />

      {/* Main Content Wrapper */}
      <div className="relative z-10 min-h-screen flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-7xl"> {/* Increased max-width for admin content */}
          
          {/* Header with Volver button and Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
            <button 
              onClick={() => navigate('/dashboard')} 
              className={`flex items-center px-4 py-2 text-sm rounded-xl transition-all duration-200 ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/60 text-gray-200 border border-gray-600/50' : 'bg-gray-200/50 hover:bg-gray-300/60 text-gray-700 border border-gray-300/50'} backdrop-blur-sm shadow-md`}
            >
              <ArrowLeft size={16} className="mr-2" /> Volver al Dashboard
            </button>
          </div>

          {/* Sección de Resumen */}
          <section className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Resumen de la Plataforma</h2>
            {loadingSummary && <p className={`text-sm p-6 text-center rounded-2xl ${darkMode ? 'bg-[#1a1a1a]/40 text-gray-400' : 'bg-[#ececec]/40 text-gray-500'} backdrop-blur-xl border ${darkMode ? 'border-gray-800/30' : 'border-white/30'} shadow-lg`}>Cargando resumen...</p>}
            {errorSummary && <p className={`text-sm p-6 text-center text-red-500 rounded-2xl ${darkMode ? 'bg-red-900/30' : 'bg-red-100/50'} backdrop-blur-xl border border-red-500/30 shadow-lg`}>Error: {errorSummary}</p>}
            {summaryData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Card Total Usuarios */}
                <div className={`p-6 rounded-2xl flex items-center space-x-4 ${darkMode ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg' : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'}`}>
                  <Users size={28} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <p className="text-3xl font-bold">{formatNumber(summaryData.totalUsers)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usuarios Totales</p>
                  </div>
                </div>
                {/* Card Total Partidas */}
                 <div className={`p-6 rounded-2xl flex items-center space-x-4 ${darkMode ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg' : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'}`}>
                  <BarChart3 size={28} className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <div>
                    <p className="text-3xl font-bold">{formatNumber(summaryData.totalGames)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Partidas Totales</p>
                  </div>
                </div>
                {/* Card Total Victorias */}
                 <div className={`p-6 rounded-2xl flex items-center space-x-4 ${darkMode ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg' : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'}`}>
                  <Trophy size={28} className={`${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                  <div>
                    <p className="text-3xl font-bold">{formatNumber(summaryData.totalWins)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Victorias Totales</p>
                  </div>
                </div>
                {/* Card Total Derrotas */}
                 <div className={`p-6 rounded-2xl flex items-center space-x-4 ${darkMode ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg' : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'}`}>
                  <Skull size={28} className={`${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                  <div>
                    <p className="text-3xl font-bold">{formatNumber(summaryData.totalLosses)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Derrotas Totales</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sección Lista de Usuarios */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Lista de Usuarios</h2>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>Haz clic en un usuario para ver sus estadísticas detalladas.</p>
            </div>
            
            {/* Contenedor de la Tabla con estilo de tarjeta */}
            <div className={`p-0 sm:p-2 md:p-4 rounded-2xl overflow-x-auto ${darkMode ? 'bg-[#1a1a1a]/40 backdrop-blur-xl border border-gray-800/30 shadow-lg' : 'bg-[#ececec]/40 backdrop-blur-xl border border-white/30 shadow-lg'}`}>
              {loadingUsers && <p className="text-sm text-center py-10">Cargando usuarios...</p>}
              {errorUsers && <p className="text-sm text-center py-10 text-red-500">Error: {errorUsers}</p>}
              {!loadingUsers && !errorUsers && (
                <table className="min-w-full">
                  <thead className={`${darkMode ? 'border-b border-gray-700/50' : 'border-b border-gray-300/50'}`}>
                    <tr>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gamertag</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rol</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nivel</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progreso</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Victorias</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Derrotas</th>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tiempo Jugado</th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-y divide-gray-700/30' : 'divide-y divide-gray-200/30'}`}>
                    {usersData.length > 0 ? (
                      usersData.map((user) => (
                        <tr 
                          key={user.id} 
                          className={`${darkMode ? 'hover:bg-black/30' : 'hover:bg-white/40'} transition-colors duration-150 cursor-pointer`}
                          onClick={() => handleUserRowClick(user)}
                        >
                          <td className="px-4 py-3 text-xs whitespace-nowrap">{user.id}</td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.gamertag}</td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                             <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-semibold rounded-full ${user.role === 'admin' ? (darkMode ? 'bg-purple-800/70 text-purple-300' : 'bg-purple-100 text-purple-800') : (darkMode ? 'bg-blue-800/70 text-blue-300' : 'bg-blue-100 text-blue-800')}`}>
                                {user.role}
                             </span>
                          </td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-center">{user.nivel}</td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-center">{user.progreso}%</td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap text-center font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{user.total_victorias ?? 0}</td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap text-center font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{user.total_derrotas ?? 0}</td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatTotalDuration(user.total_segundos_jugados)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className={`text-center py-10 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No se encontraron usuarios.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Controles de Paginación */}
            {pagination.totalPages > 1 && !loadingUsers && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm space-y-2 sm:space-y-0">
                <div>
                  <span className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Página {pagination.currentPage} de {pagination.totalPages}</span>
                  <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({pagination.totalUsers} usuarios totales)</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={pagination.currentPage <= 1}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700/60 hover:bg-gray-600/70 disabled:opacity-50 disabled:hover:bg-gray-700/60 border border-gray-600/50' : 'bg-gray-200/70 hover:bg-gray-300/70 disabled:opacity-50 disabled:hover:bg-gray-200/70 border border-gray-300/50'} backdrop-blur-sm shadow-sm disabled:cursor-not-allowed`}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700/60 hover:bg-gray-600/70 disabled:opacity-50 disabled:hover:bg-gray-700/60 border border-gray-600/50' : 'bg-gray-200/70 hover:bg-gray-300/70 disabled:opacity-50 disabled:hover:bg-gray-200/70 border border-gray-300/50'} backdrop-blur-sm shadow-sm disabled:cursor-not-allowed`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* --- MODAL PARA DETALLES DE USUARIO --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div 
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${
              darkMode 
                ? 'bg-[#1a1a1a]/80 border border-gray-700/50 shadow-xl' 
                : 'bg-[#f0f0f0]/80 border border-white/30 shadow-xl'
            } backdrop-blur-xl`}
          >
            <button 
              onClick={closeModal}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
            >
              <XCircle size={24} />
            </button>

            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Estadísticas de: {selectedUser.gamertag}
            </h2>

            {loadingUserDetails && <p className="text-center py-10 text-gray-500">Cargando detalles del usuario...</p>}
            {errorUserDetails && <p className="text-center py-10 text-red-500">Error: {errorUserDetails}</p>}
            
            {userDetailData && !loadingUserDetails && !errorUserDetails && (
              <div className="space-y-6">
                {/* Sección Resumen del Perfil (como en Dashboard.jsx) */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Resumen del Perfil</h3>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/30'} flex items-center space-x-4`}>
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-primary-yellow/20 border border-primary-yellow/50' : 'bg-blue-100 border border-blue-300'}`}>
                        <span className={`font-bold text-2xl ${darkMode ? 'text-primary-yellow' : 'text-blue-700'}`}>{userDetailData.profile.nivel}</span>
                    </div>
                    <div className="flex-grow">
                        <p className="font-bold text-xl">{userDetailData.profile.gamertag}</p>
                        <span className={`block text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Progreso al Nivel {userDetailData.profile.nivel + 1}</span>
                        <div className="relative w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden">
                            <div 
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-yellow-400 to-primary-yellow dark:from-yellow-500 dark:to-yellow-400 shadow-inner"
                                style={{ width: `${userDetailData.profile.progreso}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-end pr-3">
                                <span className={`text-[10px] font-bold ${userDetailData.profile.progreso > 50 ? 'text-gray-800' : (darkMode? 'text-gray-200' : 'text-gray-700') } mix-blend-difference`}>
                                    {userDetailData.profile.progreso} / 100 XP
                                </span>
                            </div>
                        </div>
                    </div>
                  </div>
                </section>

                {/* Sección Rendimiento General (como en Dashboard.jsx) */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Rendimiento General</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                        { label: 'Partidas Jugadas', value: userDetailData.totals.partidas },
                        { label: 'Victorias', value: userDetailData.totals.victorias, color: 'text-green-500' },
                        { label: 'Derrotas', value: userDetailData.totals.derrotas, color: 'text-red-500' },
                        { label: 'Tasa Victorias', value: `${userDetailData.totals.winRate}%` },
                    ].map(item => (
                        <div key={item.label} className={`p-3 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/30'}`}>
                            <p className={`text-2xl font-bold ${item.color || ''}`}>{item.value}</p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
                        </div>
                    ))}
                     <div className={`p-3 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/30'} col-span-2 md:col-span-2`}>
                        <p className="text-xl font-semibold">{formatTotalDuration(userDetailData.totals.totalTimePlayedSeconds)}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tiempo Total Jugado</p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/30'} col-span-2 md:col-span-2`}>
                         <p className="text-xl font-semibold">{formatTotalDuration(userDetailData.totals.avgTimePerGameSeconds)}</p>
                         <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tiempo Medio / Partida</p>
                    </div>
                  </div>
                </section>

                {/* Sección Charts (como en Dashboard.jsx) */}
                <section className="grid md:grid-cols-2 gap-6">
                    {/* Win Rate Pie Chart */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/30'}`}>
                        <h3 className="text-md font-semibold mb-2 text-center">Victorias vs Derrotas</h3>
                        {(userDetailData.totals.partidas > 0) ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie 
                                        data={[
                                            { name: 'Victorias', value: userDetailData.totals.victorias },
                                            { name: 'Derrotas', value: userDetailData.totals.derrotas },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        fontSize={12}
                                    >
                                        <Cell key={`cell-0`} fill={darkMode ? "#4ade80" : "#16a34a"} />
                                        <Cell key={`cell-1`} fill={darkMode ? "#f87171" : "#dc2626"} />
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ backgroundColor: darkMode ? '#333' : '#fff', border: 'none', borderRadius: '8px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-gray-500 text-center pt-10">No hay datos suficientes.</p>
                        )}
                    </div>

                    {/* Daily Activity Bar Chart */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/30'}`}>
                         <h3 className="text-md font-semibold mb-2 text-center">Actividad Diaria (Victorias/Derrotas)</h3>
                         {(userDetailData.dailyActivity && userDetailData.dailyActivity.length > 0) ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={userDetailData.dailyActivity} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} opacity={0.5}/>
                                    <XAxis dataKey="day" stroke={darkMode ? '#999' : '#666'} tick={{ fontSize: 10 }}/>
                                    <YAxis stroke={darkMode ? '#999' : '#666'} tick={{ fontSize: 10 }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#333' : '#fff', border: 'none', borderRadius: '8px'}} itemStyle={{ color: darkMode ? '#ddd' : '#333' }} labelStyle={{ fontWeight: 'bold'}}/>
                                    <Legend wrapperStyle={{ fontSize: '10px'}} />
                                    <Bar dataKey="victorias" fill={darkMode ? "#4ade80" : "#16a34a"} name="Victorias" />
                                    <Bar dataKey="derrotas" fill={darkMode ? "#f87171" : "#dc2626"} name="Derrotas" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <p className="text-sm text-gray-500 text-center pt-10">No hay actividad reciente.</p>
                        )}
                    </div>
                </section>
                
                {/* Sección Historial Reciente (como en Dashboard.jsx) */}
                <section>
                     <h3 className="text-lg font-semibold mb-3">Historial Reciente </h3>
                     {(userDetailData.history && userDetailData.history.length > 0) ? (
                        <div className={`rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/30'} overflow-hidden max-h-60 overflow-y-auto`}> 
                            <ul className={`divide-y ${darkMode ? 'divide-gray-700/50' : 'divide-gray-200/50'}`}>
                                {userDetailData.history.map((game, index) => (
                                    <li key={index} className="flex justify-between items-center text-sm p-3">
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{game.date}</span>
                                        <span className={`font-medium ${game.outcome === 'victory' ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                                            {game.outcome === 'victory' ? '🏆 Victoria' : '💀 Derrota'}
                                        </span>
                                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {game.time} 
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                     ) : (
                         <p className="text-sm text-gray-500 text-center py-4">No hay historial de partidas.</p>
                     )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}
      {/* --- FIN MODAL --- */}
    </div>
  );
};

export default AdminDashboard; 