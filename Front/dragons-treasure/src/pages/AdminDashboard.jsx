import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart3, Trophy, Skull, Percent, Clock, ArrowLeft } from 'lucide-react';

// Definir URL Base de la API (importante que coincida con Dashboard/Login)
const API_BASE_URL = 'https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com'; 

// --- Helper para formatear números grandes (ej. 1000 -> 1k) ---
const formatNumber = (num) => {
  if (num === null || num === undefined) return '--';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

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

  // --- Función para obtener el resumen de la plataforma ---
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setErrorSummary(null);
    const token = localStorage.getItem('token'); // Nuestro token JWT
    if (!token) {
      setErrorSummary('No autenticado');
      setLoadingSummary(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
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
  }, []);

  // --- Función para obtener la lista de usuarios (paginada) ---
  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    setLoadingUsers(true);
    setErrorUsers(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorUsers('No autenticado');
      setLoadingUsers(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
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
  }, []);

  // --- Efecto para cargar datos iniciales ---
  useEffect(() => {
    fetchSummary();
    fetchUsers(); // Cargar primera página de usuarios
  }, [fetchSummary, fetchUsers]);

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
    <div className={`min-h-screen p-8 font-crossten ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Botón para volver al Dashboard normal */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className={`absolute top-4 left-4 flex items-center px-3 py-1 text-xs rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
      >
        <ArrowLeft size={14} className="mr-1" /> Volver
      </button>

      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Sección de Resumen */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Resumen de la Plataforma</h2>
        {loadingSummary && <p>Cargando resumen...</p>}
        {errorSummary && <p className="text-red-500">Error: {errorSummary}</p>}
        {summaryData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card Total Usuarios */}
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <Users size={24} className="text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(summaryData.totalUsers)}</p>
                <p className="text-xs text-gray-500">Usuarios Totales</p>
              </div>
            </div>
            {/* Card Total Partidas */}
             <div className={`p-4 rounded-lg flex items-center space-x-3 ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <BarChart3 size={24} className="text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(summaryData.totalGames)}</p>
                <p className="text-xs text-gray-500">Partidas Totales</p>
              </div>
            </div>
            {/* Card Total Victorias */}
             <div className={`p-4 rounded-lg flex items-center space-x-3 ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <Trophy size={24} className="text-green-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(summaryData.totalWins)}</p>
                <p className="text-xs text-gray-500">Victorias Totales</p>
              </div>
            </div>
            {/* Card Total Derrotas */}
             <div className={`p-4 rounded-lg flex items-center space-x-3 ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <Skull size={24} className="text-red-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(summaryData.totalLosses)}</p>
                <p className="text-xs text-gray-500">Derrotas Totales</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Sección Lista de Usuarios */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Lista de Usuarios</h2>
        {loadingUsers && <p>Cargando usuarios...</p>}
        {errorUsers && <p className="text-red-500">Error: {errorUsers}</p>}
        
        {/* Tabla de Usuarios */}
        <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <table className="min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Gamertag</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Rol</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nivel</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Progreso</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Victorias</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Derrotas</th>
                {/* Añadir más columnas si es necesario */}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
              {usersData.length > 0 ? (
                usersData.map((user) => (
                  <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{user.id}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-medium">{user.gamertag}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                       <span className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                          {user.role}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{user.nivel}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{user.progreso}%</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-green-600 dark:text-green-400">{user.total_victorias ?? 0}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-red-600 dark:text-red-400">{user.total_derrotas ?? 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-sm text-gray-500">No se encontraron usuarios.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center text-sm">
            <div>
              <span className="mr-2">Página {pagination.currentPage} de {pagination.totalPages}</span>
              <span className="text-gray-500">({pagination.totalUsers} usuarios totales)</span>
            </div>
            <div className="space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={pagination.currentPage <= 1}
                className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 disabled:opacity-50' : 'bg-gray-200 disabled:opacity-50'}`}
              >
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={pagination.currentPage >= pagination.totalPages}
                className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 disabled:opacity-50' : 'bg-gray-200 disabled:opacity-50'}`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};

export default AdminDashboard; 