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
            SELECT id, gamertag, email, role, nivel, progreso, total_victorias, total_derrotas, total_partidas 
            FROM usuario 
            ORDER BY id ASC 
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