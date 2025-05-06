import { pool } from '../helpers/mysql-config.js';

// --- Helper function to format SECONDS into H:M:S or M:S string ---
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

// --- Renamed and Enhanced: Get User Statistics Summary --- 
const getUserSummary = async (req, res, next) => {
    const userId = req.userId; // From verifyTokenPresence middleware

    if (!userId) {
        console.warn('[UserSummary] userId missing from request after middleware.');
        return res.status(401).json({ message: 'Usuario no autenticado correctamente.' });
    }

    console.log(`[UserSummary] Fetching statistics summary for user ID: ${userId}`);
    let connection;

    try {
        connection = await pool.getConnection();

        // --- Query 1: User Profile and Totals ---
        const [userResults] = await connection.query(
            'SELECT gamertag, nivel, progreso, total_victorias, total_derrotas, total_partidas FROM usuario WHERE id = ?',
            [userId]
        );

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const userData = userResults[0];

        // --- Query 2: Time Aggregates ---
        const [timeResults] = await connection.query(
            `SELECT 
                SUM(TIME_TO_SEC(duracion_partida)) AS total_segundos_jugados,
                AVG(TIME_TO_SEC(duracion_partida)) AS media_segundos_partida
             FROM estadistica 
             WHERE idUsuario = ? AND idTipo IN (1, 2)`, // Filter by game records
            [userId]
        );
        const timeData = timeResults[0]; // SUM/AVG always return one row

        // --- Query 3: History (Last 15 games) ---
        console.log(`[UserSummary History] Ejecutando query de historial para userId: ${userId}`);
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
        console.log(`[UserSummary History] Resultados crudos de la BD:`, historyResults);
        console.log(`[UserSummary History] Número de partidas encontradas: ${historyResults.length}`);

        // Format history data
        const gameHistory = historyResults.map(game => ({
            date: game.fecha_hora.toISOString().split('T')[0], // Format as YYYY-MM-DD
            time: formatSecondsToHMS(game.duration_seconds),
            outcome: game.idTipo === 1 ? 'victory' : 'defeat'
        }));
        console.log(`[UserSummary History] Array gameHistory formateado:`, gameHistory);

        // --- Query 4: Wins/Losses per Day (Last 7 days) ---
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
         // Format daily data for chart
        const dailyChartData = dailyResults.map(day => ({
            day: new Date(day.dia + 'T00:00:00Z').toLocaleDateString('es-ES', { weekday: 'short' }),
            victorias: day.victorias_dia,
            derrotas: day.derrotas_dia
        }));

        // --- Calculate Win Rate ---
        const winRate = userData.total_partidas > 0 
            ? ((userData.total_victorias / userData.total_partidas) * 100).toFixed(1) 
            : 0;

        // --- Combine all data ---
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
                winRate: parseFloat(winRate), // Send as number
                totalTimePlayedSeconds: parseInt(timeData.total_segundos_jugados, 10) || 0,
                avgTimePerGameSeconds: parseFloat(timeData.media_segundos_partida) || 0
            },
            history: gameHistory,
            dailyActivity: dailyChartData
        };

        console.log(`[UserSummary] Summary generated for user ID: ${userId}`);
        res.json(summary);

    } catch (error) {
        console.error(`[UserSummary] Error fetching summary for user ID ${userId}:`, error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// --- NEW: Record Game Result (Victory or Defeat) ---
const recordGameController = async (req, res, next) => {
    const { outcome, durationSeconds } = req.body;
    const userId = req.userId; // Get userId attached by the verifyTokenPresence middleware

    // --- Input Validation ---
    if (!userId) {
        // This shouldn't happen if middleware ran correctly, but double-check
        console.warn('[RecordGame] userId missing from request after middleware.');
        return res.status(401).json({ message: 'Usuario no autenticado correctamente.' });
    }
    if (!outcome || (outcome !== 'victory' && outcome !== 'defeat')) {
        return res.status(400).json({ message: 'El campo "outcome" es inválido (debe ser "victory" o "defeat").' });
    }
    if (durationSeconds === undefined || typeof durationSeconds !== 'number' || durationSeconds < 0) {
        return res.status(400).json({ message: 'El campo "durationSeconds" es inválido (debe ser un número positivo).' });
    }
    // --- End Validation ---

    const idTipo = (outcome === 'victory') ? 1 : 2;
    const pointsToAdd = (outcome === 'victory') ? 10 : -5;
    const victoriesToAdd = (outcome === 'victory') ? 1 : 0;
    const defeatsToAdd = (outcome === 'defeat') ? 1 : 0;
    const pointsNeededForLevelUp = 100;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        console.log(`[RecordGame] Iniciando transacción para usuario ${userId}, outcome: ${outcome}`);

        // 1. Obtener estado actual del usuario (con bloqueo para la transacción)
        const [users] = await connection.query(
            'SELECT nivel, progreso, total_victorias, total_derrotas, total_partidas FROM usuario WHERE id = ? FOR UPDATE;',
            [userId]
        );

        if (users.length === 0) {
            throw new Error(`Usuario con ID ${userId} no encontrado.`);
        }

        let currentLevel = users[0].nivel;
        let currentProgress = users[0].progreso;

        // 2. Calcular nuevo progreso y nivel
        let newProgress = currentProgress + pointsToAdd;
        let newLevel = currentLevel;
        
        // Asegurar que el progreso no sea negativo (ajustar si se permite)
        if (newProgress < 0) {
            newProgress = 0;
        }

        // 3. Manejar subida de nivel
        while (newProgress >= pointsNeededForLevelUp) {
            newLevel += 1;
            newProgress -= pointsNeededForLevelUp;
            console.log(`[RecordGame] ¡Usuario ${userId} subió a nivel ${newLevel}!`);
        }

        // 4. Insertar el registro de la partida en estadistica
        const [insertResult] = await connection.query(
            'INSERT INTO estadistica (idUsuario, idTipo, fecha_hora, duracion_partida) VALUES (?, ?, NOW(), SEC_TO_TIME(?));',
            [userId, idTipo, durationSeconds]
        );
        console.log(`[RecordGame] Partida insertada en estadistica con ID: ${insertResult.insertId}`);

        // 5. Actualizar los datos del usuario (nivel, progreso, totales)
        // Log values before update
        console.log(`[RecordGame] Attempting to update usuario ID ${userId} with: nivel=${newLevel}, progreso=${newProgress}, vict+=${victoriesToAdd}, derr+=${defeatsToAdd}`);
        const [updateResult] = await connection.query(
            'UPDATE usuario SET nivel = ?, progreso = ?, total_victorias = total_victorias + ?, total_derrotas = total_derrotas + ?, total_partidas = total_partidas + 1 WHERE id = ?',
            [newLevel, newProgress, victoriesToAdd, defeatsToAdd, userId]
        );
        // Log affected rows after update
        console.log(`[RecordGame] Update result for usuario ID ${userId}: affectedRows=${updateResult.affectedRows}`);
        
        if (updateResult.affectedRows === 0) {
             throw new Error(`No se pudo actualizar el usuario con ID ${userId}.`);
        }
        console.log(`[RecordGame] Datos del usuario ${userId} actualizados.`);

        // 6. Confirmar transacción
        await connection.commit();
        console.log(`[RecordGame] Transacción completada exitosamente para usuario ${userId}.`);

        res.status(201).json({ 
            success: true, 
            message: 'Partida registrada y progreso actualizado.',
            levelInfo: { // Opcional: devolver nuevo estado
                nivel: newLevel,
                progreso: newProgress
            }
        });

    } catch (error) {
        console.error(`[RecordGame] Error en transacción para usuario ${userId}:`, error);
        if (connection) {
            await connection.rollback(); // Revertir cambios si hubo error
            console.log(`[RecordGame] Rollback ejecutado para usuario ${userId}.`);
        }
        // Pasar el error al manejador centralizado (o enviar respuesta 500)
        next(error); 
        // Alternativa: res.status(500).json({ message: 'Error interno al registrar la partida.' });
    } finally {
        if (connection) {
            connection.release(); // Liberar la conexión siempre
        }
    }
};
// --- Fin NEW ---

// --- Obtener Últimas 5 Partidas del Usuario ---
export const getUltimasPartidas = async (req, res, next) => {
    // const { idUsuario } = req.params; // OLD: From params
    const userId = req.userId; // NEW: Get from middleware

    // if (!idUsuario) { ... } -> OLD check
    if (!userId) {
        console.warn('[UltimasPartidas] userId missing from request after middleware.');
        return res.status(401).json({ message: 'Usuario no autenticado correctamente.' });
    }

    try {
        console.log(`Fetching last 5 games for user ID: ${userId}`);
        // Query updated to use idTipo instead of victorias/derrotas column
        const query = `
            SELECT 
                idTipo, 
                TIME_TO_SEC(duracion_partida) as time 
            FROM estadistica 
            WHERE idUsuario = ? 
            ORDER BY fecha_hora DESC 
            LIMIT 5;
        `;
        const [results] = await pool.query(query, [userId]);

        // Map results to determine outcome based on idTipo
        const formattedResults = results.map(row => ({
            outcome: row.idTipo === 1 ? 'victory' : 'defeat', // 1 = victory, 2 = defeat
            time: row.time 
        }));

        console.log(`Found ${formattedResults.length} recent games for user ID: ${userId}`);
        res.json(formattedResults);

    } catch (error) {
        console.error(`Error fetching recent games for user ID ${userId}:`, error);
        next(error); // Pass error to the central handler
    }
};

// --- Obtener Leaderboard (Top 5 Victorias) --- 
// Changed logic to use total_victorias from usuario table
export const getLeaderboard = async (req, res, next) => {
    try {
        console.log("Fetching leaderboard data (Top 5 Victorias)...");
        const query = `
            SELECT 
                gamertag AS name, 
                total_victorias AS victorias 
            FROM usuario
            ORDER BY total_victorias DESC, id ASC -- Desempate por ID o fecha de registro?
            LIMIT 5;
        `;
        const [results] = await pool.query(query);
        
        // Add rank to the results
        const leaderboardData = results.map((user, index) => ({
            rank: index + 1,
            name: user.name,
            victorias: user.victorias
        }));

        console.log(`Leaderboard data fetched: ${leaderboardData.length} players.`);
        res.json(leaderboardData);

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        next(error);
    }
};

// --- Obtener Tiempo Jugado (del Usuario Actual) ---
export const getTiempoJugado = async (req, res, next) => {
    // const { idUsuario } = req.params; // OLD: From params
    const userId = req.userId; // NEW: Get from middleware

    // if (!idUsuario) { ... } -> OLD check
     if (!userId) {
        console.warn('[TiempoJugado] userId missing from request after middleware.');
        return res.status(401).json({ message: 'Usuario no autenticado correctamente.' });
    }

    try {
        console.log(`Fetching time played per day for user ID: ${userId} (Last 7 days)`);
        const query = `
            SELECT 
                DATE(fecha_hora) as date,
                SUM(TIME_TO_SEC(duracion_partida)) as totalSeconds
            FROM 
                estadistica
            WHERE 
                idUsuario = ? AND 
                fecha_hora >= CURDATE() - INTERVAL 6 DAY
            GROUP BY 
                DATE(fecha_hora)
            ORDER BY
                date ASC;
        `; // Asegura que solo tome los últimos 7 días incluyendo hoy
        const [results] = await pool.query(query, [userId]);
        
        console.log(`Found ${results.length} daily time records for user ID: ${userId}`);
        res.json(results);

    } catch (error) {
        console.error(`Error fetching time played for user ID ${userId}:`, error);
        next(error); // Pass error to the central handler
    }
};

// Export the controllers
export { 
    getUserSummary, // Use the new summary function
    recordGameController
    // getUltimasPartidas, // Exported individually
    // getLeaderboard, // Exported individually
    // getTiempoJugado // Exported individually
};