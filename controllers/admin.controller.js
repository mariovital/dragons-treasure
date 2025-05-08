import { pool } from '../helpers/mysql-config.js';

// Controlador para obtener un resumen general de la plataforma
export const getPlatformSummary = async (req, res, next) => {
    console.log('[Admin Controller] Fetching platform summary...');
    // TODO: Implementar lógica SQL para obtener:
    // - COUNT(*) de usuarios
    // - SUM(total_partidas) de usuarios
    // - SUM(total_victorias) de usuarios
    // - SUM(total_derrotas) de usuarios
    
    try {
        // --- Lógica SQL Placeholder ---
        const [userCountResult] = await pool.query('SELECT COUNT(*) as totalUsers FROM usuario');
        const [gameStatsResult] = await pool.query('SELECT SUM(total_partidas) as totalGames, SUM(total_victorias) as totalWins, SUM(total_derrotas) as totalLosses FROM usuario');
        
        const summary = {
            totalUsers: userCountResult[0].totalUsers || 0,
            totalGames: parseInt(gameStatsResult[0].totalGames, 10) || 0,
            totalWins: parseInt(gameStatsResult[0].totalWins, 10) || 0,
            totalLosses: parseInt(gameStatsResult[0].totalLosses, 10) || 0,
        };
        // --- Fin Placeholder ---

        console.log('[Admin Controller] Platform summary data:', summary);
        res.json({ success: true, summary });

    } catch (error) {
        console.error('[Admin Controller] Error fetching platform summary:', error);
        next(error);
    }
};

// Controlador para obtener una lista paginada de todos los usuarios
export const getAllUsers = async (req, res, next) => {
    // Obtener parámetros de paginación (ej. /admin/users?page=1&limit=10)
    const page = parseInt(req.query.page, 10) || 1; // Página actual, por defecto 1
    const limit = parseInt(req.query.limit, 10) || 10; // Resultados por página, por defecto 10
    const offset = (page - 1) * limit; // Calcular offset para SQL

    console.log(`[Admin Controller] Fetching user list... Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

    // TODO: Implementar búsqueda y ordenamiento si se desea

    try {
        // --- Lógica SQL Placeholder para paginación ---
        // 1. Obtener el total de usuarios para calcular el total de páginas
        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM usuario');
        const totalUsers = totalResult[0].total;
        const totalPages = Math.ceil(totalUsers / limit);

        // 2. Obtener los usuarios para la página actual
        const query = `
            SELECT 
                u.id, 
                u.gamertag, 
                u.email, 
                u.role, 
                u.nivel, 
                u.progreso, 
                u.total_victorias, 
                u.total_derrotas, 
                u.total_partidas,
                COALESCE(SUM(TIME_TO_SEC(e.duracion_partida)), 0) as total_segundos_jugados
            FROM 
                usuario u
            LEFT JOIN 
                estadistica e ON u.id = e.idUsuario AND e.idTipo IN (1, 2)
            GROUP BY
                u.id, u.gamertag, u.email, u.role, u.nivel, u.progreso, u.total_victorias, u.total_derrotas, u.total_partidas
            ORDER BY 
                u.id ASC 
            LIMIT ? 
            OFFSET ?;
        `;
        const [users] = await pool.query(query, [limit, offset]);
        // --- Fin Placeholder ---
        
        console.log(`[Admin Controller] Found ${users.length} users for page ${page}. Total users: ${totalUsers}`);
        res.json({ 
            success: true, 
            users: users, 
            pagination: { 
                currentPage: page, 
                totalPages: totalPages, 
                totalUsers: totalUsers, 
                limit: limit 
            } 
        });

    } catch (error) {
        console.error('[Admin Controller] Error fetching user list:', error);
        next(error);
    }
};

// Helper function to format SECONDS into H:M:S or M:S string
// (Copiada de estadistica.controller.js para autosuficiencia, considera mover a un archivo de helpers compartido)
function formatSecondsToHMS(totalSeconds) {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
        return '--:--';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
  
    let result = '';
    if (hours > 0) {
      result += `${hours}:`;
    }
    result += `${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:${seconds.toString().padStart(2, '0')}`;
    return result; // e.g., "1:25:03" or "15:32"
}

// --- NUEVA FUNCIÓN: Get User Statistics Summary for Admin --- 
export const getUserStatsForAdmin = async (req, res, next) => {
    const userId = req.params.id; // Obtener el ID del usuario de los parámetros de la ruta

    if (!userId) {
        // Esto no debería ocurrir si la ruta está bien definida, pero es una verificación.
        return res.status(400).json({ success: false, message: 'ID de usuario no proporcionado.' });
    }

    console.log(`[AdminStats] Fetching statistics summary for user ID: ${userId}`);
    let connection;

    try {
        connection = await pool.getConnection();

        // --- Query 1: User Profile and Totals from 'usuario' table ---
        const [userResults] = await connection.query(
            'SELECT gamertag, nivel, progreso, total_victorias, total_derrotas, total_partidas FROM usuario WHERE id = ?',
            [userId]
        );

        if (userResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
        const userData = userResults[0];

        // --- Query 2: Time Aggregates from 'estadistica' table ---
        const [timeResults] = await connection.query(
            `SELECT 
                SUM(TIME_TO_SEC(duracion_partida)) AS total_segundos_jugados,
                AVG(TIME_TO_SEC(duracion_partida)) AS media_segundos_partida
             FROM estadistica 
             WHERE idUsuario = ? AND idTipo IN (1, 2)`, // Filtrar por registros de partidas (victoria/derrota)
            [userId]
        );
        const timeData = timeResults[0] || { total_segundos_jugados: 0, media_segundos_partida: 0 }; // Proporcionar valores por defecto si no hay partidas

        // --- Query 3: History (Last 15 games) from 'estadistica' table ---
        const [historyResults] = await connection.query(
            `SELECT 
                fecha_hora, 
                TIME_TO_SEC(duracion_partida) as duration_seconds, 
                idTipo 
             FROM estadistica 
             WHERE idUsuario = ? AND idTipo IN (1, 2)
             ORDER BY fecha_hora DESC 
             LIMIT 15`,
            [userId]
        );
        
        const gameHistory = historyResults.map(game => ({
            date: game.fecha_hora.toISOString().split('T')[0], // Formato YYYY-MM-DD
            time: formatSecondsToHMS(game.duration_seconds),
            outcome: game.idTipo === 1 ? 'victory' : 'defeat'
        }));

        // --- Query 4: Wins/Losses per Day (Last 7 days) from 'estadistica' table ---
        const [dailyResults] = await connection.query(
            `SELECT 
                DATE(fecha_hora) as dia,
                SUM(CASE WHEN idTipo = 1 THEN 1 ELSE 0 END) as victorias_dia,
                SUM(CASE WHEN idTipo = 2 THEN 1 ELSE 0 END) as derrotas_dia
            FROM 
                estadistica
            WHERE 
                idUsuario = ? AND idTipo IN (1, 2) AND fecha_hora >= CURDATE() - INTERVAL 6 DAY
            GROUP BY 
                dia
            ORDER BY
                dia ASC;`,
            [userId]
        );
        
        const dailyChartData = dailyResults.map(dayData => ({
            day: new Date(dayData.dia + 'T00:00:00Z').toLocaleDateString('es-ES', { weekday: 'short' }), // Asegura que la fecha se interprete como UTC
            victorias: parseInt(dayData.victorias_dia, 10) || 0,
            derrotas: parseInt(dayData.derrotas_dia, 10) || 0
        }));

        // --- Calculate Win Rate ---
        const winRate = userData.total_partidas > 0 
            ? parseFloat(((userData.total_victorias / userData.total_partidas) * 100).toFixed(1))
            : 0;

        // --- Combine all data into the summary object ---
        const summary = {
            profile: {
                gamertag: userData.gamertag,
                nivel: userData.nivel,
                progreso: userData.progreso
            },
            totals: {
                victorias: userData.total_victorias,
                derrotas: userData.total_derrotas,
                partidas: userData.total_partidas,
                winRate: winRate,
                totalTimePlayedSeconds: parseInt(timeData.total_segundos_jugados, 10) || 0,
                avgTimePerGameSeconds: parseFloat(timeData.media_segundos_partida) || 0
            },
            history: gameHistory,
            dailyActivity: dailyChartData
        };

        console.log(`[AdminStats] Summary generated for user ID: ${userId}`);
        res.json({ success: true, summary: summary });

    } catch (error) {
        console.error(`[AdminStats] Error fetching summary for user ID ${userId}:`, error);
        // Evitar enviar el objeto de error completo al cliente en producción por seguridad
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener estadísticas del usuario.' });
        // Opcionalmente, usar next(error) si tienes un manejador de errores centralizado más sofisticado.
        // next(error); 
    } finally {
        if (connection) connection.release();
    }
}; 