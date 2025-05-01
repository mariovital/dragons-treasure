import { pool } from '../helpers/mysql-config.js';

// Removed getUserId(gamertag) as gamertag is no longer used for user identification here.
// We will assume idUsuario is provided directly.

// Helper function to get or create a specific statistic entry for a user
async function getOrCreateStatistic(idUsuario, idTipo) {
    const [rows] = await pool.query(
        "SELECT * FROM estadistica WHERE idUsuario = ? AND idTipo = ?",
        [idUsuario, idTipo]
    );
    if (rows.length > 0) {
        return rows[0]; // Return existing statistic
    } else {
        // Create a new entry if it doesn't exist, initialize value and time appropriately
        const now = new Date();
        const [result] = await pool.query(
            "INSERT INTO estadistica (idUsuario, idTipo, valor_INT, valor_TIME, fecha_hora) VALUES (?, ?, 0, '00:00:00', ?)",
            [idUsuario, idTipo, now]
        );
        // Fetch the newly created row
        const [newRow] = await pool.query("SELECT * FROM estadistica WHERE id = ?", [result.insertId]);
        return newRow[0];
    }
}

// Get all statistics for a specific user
const getStat = async (req, res) => {
    // Assuming idUsuario is passed as a URL parameter
    const { idUsuario } = req.params;
    console.log("User ID received for stats:", idUsuario);

    if (!idUsuario) {
         return res.status(400).json({ message: 'User ID (idUsuario) is required' });
    }

    try {
        // Fetch all statistics for the user, joining with tipoEstadistica for context
        const [results] = await pool.query(
           `SELECT e.*, t.nombre as tipoNombre
            FROM estadistica e
            JOIN tipoEstadistica t ON e.idTipo = t.id
            WHERE e.idUsuario = ?`,
           [idUsuario]
        );

        if (results.length === 0) {
            // It's okay if a user has no stats yet, return an empty array or appropriate message
            return res.status(200).json([]); // Return empty array if no stats found
        }

        res.json(results); // Return all found statistics
    } catch (err) {
        console.error('Error fetching statistics:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// --- Función para actualizar nivel y progreso ---
// Separamos la lógica para reutilizarla o testearla más fácil
async function updateLevelProgress(idUsuario, pointsToAdd) {
    const connection = await pool.getConnection(); // Usar transacción para asegurar consistencia
    try {
        await connection.beginTransaction();

        // 1. Obtener nivel y progreso actual del usuario
        const [users] = await connection.query(
            'SELECT nivel, progreso FROM usuario WHERE id = ? FOR UPDATE;', // FOR UPDATE bloquea la fila
            [idUsuario]
        );

        if (users.length === 0) {
            console.error(`[Level] Usuario con ID ${idUsuario} no encontrado para actualizar progreso.`);
            await connection.rollback(); // Deshacer transacción
            return; // Salir si el usuario no existe
        }

        let currentLevel = users[0].nivel;
        let currentProgress = users[0].progreso;

        // 2. Calcular nuevo progreso y nivel
        let newProgress = currentProgress + pointsToAdd;
        let newLevel = currentLevel;
        const pointsNeededForLevelUp = 100;

        // 3. Manejar subida de nivel (puede subir varios niveles si gana muchos puntos)
        while (newProgress >= pointsNeededForLevelUp) {
            newLevel += 1;
            newProgress -= pointsNeededForLevelUp;
            console.log(`[Level] ¡Usuario ${idUsuario} subió a nivel ${newLevel}! Progreso restante: ${newProgress}`);
        }

        // 4. Actualizar la tabla usuario
        await connection.query(
            'UPDATE usuario SET nivel = ?, progreso = ? WHERE id = ?',
            [newLevel, newProgress, idUsuario]
        );

        await connection.commit(); // Confirmar transacción
        console.log(`[Level] Progreso actualizado para usuario ${idUsuario}. Nivel: ${newLevel}, Progreso: ${newProgress}`);

    } catch (error) {
        console.error(`[Level] Error actualizando nivel/progreso para usuario ${idUsuario}:`, error);
        await connection.rollback(); // Revertir en caso de error
        // Considera lanzar el error para manejarlo más arriba si es necesario
        // throw error;
    } finally {
        connection.release(); // Siempre liberar la conexión
    }
}
// --- Fin función --- 

// Record a victory (assuming idTipo = 1 for 'victorias')
const recordVictory = async (req, res) => {
    const { idUsuario } = req.body;
    const idTipoVictoria = 1; 
    const pointsPerVictory = 10; // Puntos a añadir por victoria

    console.log("Record victory request for user ID:", idUsuario);

    if (!idUsuario) {
        return res.status(400).json({ code: 0, message: "User ID (idUsuario) is required" });
    }

    try {
        // --- Registrar la estadística de victoria (como antes) ---
        const statEntry = await getOrCreateStatistic(idUsuario, idTipoVictoria);
        const newValorInt = (statEntry.valor_INT || 0) + 1;
        const now = new Date();
        await pool.query(
            "UPDATE estadistica SET valor_INT = ?, fecha_hora = ? WHERE id = ?",
            [newValorInt, now, statEntry.id]
        );
        const [updatedStats] = await pool.query("SELECT * FROM estadistica WHERE idUsuario = ? AND idTipo = ?", [idUsuario, idTipoVictoria]);
        console.log(`[Stats] Estadística de victoria actualizada para usuario ${idUsuario}.`);
        // --- Fin registro estadística ---

        // --- Actualizar Nivel y Progreso --- 
        await updateLevelProgress(idUsuario, pointsPerVictory);
        // --- Fin actualización Nivel/Progreso ---

        res.json({
            code: 1,
            message: "Victory recorded and progress updated",
            idUsuario: idUsuario,
            statistic: updatedStats[0] 
        });
    } catch (err) {
        // El error del nivel/progreso ya se loggea en updateLevelProgress
        // Solo loggeamos errores del registro de estadísticas aquí
        console.error(`[Stats] Error recording victory stats for user ${idUsuario}:`, err); 
        res.status(500).json({ code: 0, message: "Error recording victory" });
    }
};

// Record a defeat (assuming idTipo = 2 for 'derrotas')
const recordDefeat = async (req, res) => {
    // Expect idUsuario in the request body now instead of gamertag
    const { idUsuario } = req.body;
    const idTipoDerrota = 2; // *** ASSUMPTION: idTipo 2 corresponds to 'derrotas' ***

    console.log("Record defeat request for user ID:", idUsuario);

     if (!idUsuario) {
        return res.status(400).json({ code: 0, message: "User ID (idUsuario) is required" });
    }

    try {
        // Get the current or new statistic entry for defeats
        const statEntry = await getOrCreateStatistic(idUsuario, idTipoDerrota);

        // Increment the integer value (number of defeats)
        const newValorInt = (statEntry.valor_INT || 0) + 1;
        const now = new Date();

        // Update the statistic entry
        await pool.query(
            "UPDATE estadistica SET valor_INT = ?, fecha_hora = ? WHERE id = ?",
            [newValorInt, now, statEntry.id]
        );

         // Optionally, fetch the updated stats to return
        const [updatedStats] = await pool.query("SELECT * FROM estadistica WHERE idUsuario = ? AND idTipo = ?", [idUsuario, idTipoDerrota]);

        res.json({
            code: 1,
            message: "Defeat recorded",
            idUsuario: idUsuario,
            statistic: updatedStats[0] // Return the updated specific statistic
        });
    } catch (err) {
        console.error('Error recording defeat:', err);
        res.status(500).json({ code: 0, message: "Error recording defeat" });
    }
};

// --- Obtener Últimas 5 Partidas del Usuario ---
export const getUltimasPartidas = async (req, res, next) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        console.log(`Fetching last 5 games for user ID: ${idUsuario}`);
        const query = `
            SELECT 
                victorias, 
                derrotas, 
                TIME_TO_SEC(duracion_partida) as time 
            FROM estadistica 
            WHERE idUsuario = ? 
            ORDER BY fecha_hora DESC 
            LIMIT 5;
        `;
        const [results] = await pool.query(query, [idUsuario]);

        // Map results to determine outcome based on victorias/derrotas
        const formattedResults = results.map(row => ({
            // Determine outcome: If victorias > 0, it's a win, otherwise a loss
            outcome: row.victorias > 0 ? 'victory' : 'defeat',
            time: row.time // Already selected as time in seconds
        }));

        console.log(`Found ${formattedResults.length} recent games for user ID: ${idUsuario}`);
        res.json(formattedResults);

    } catch (error) {
        console.error(`Error fetching recent games for user ID ${idUsuario}:`, error);
        next(error); // Pass error to the central handler
    }
};

// --- Obtener Leaderboard (Top 5 Victorias más Rápidas) --- 
// Ensure this function is defined with export const
export const getLeaderboard = async (req, res, next) => {
    try {
        console.log("Fetching leaderboard data...");
        const query = `
            SELECT 
                u.gamertag, 
                TIME_TO_SEC(e.duracion_partida) as time
            FROM estadistica e
            JOIN usuario u ON e.idUsuario = u.id
            WHERE e.victorias > 0 AND e.duracion_partida IS NOT NULL -- Only wins with a valid duration
            ORDER BY e.duracion_partida ASC 
            LIMIT 5;
        `;
        const [results] = await pool.query(query);

        // Map results to add rank and use gamertag as name
        const formattedResults = results.map((row, index) => ({
            rank: index + 1,
            name: row.gamertag, // Use gamertag as requested
            time: row.time // Already selected as time in seconds
        }));

        console.log(`Leaderboard data fetched: ${formattedResults.length} players.`);
        res.json(formattedResults);

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        next(error); // Pass error to the central handler
    }
};

// --- Obtener Tiempo Jugado por Día (Últimos 7 días) ---
// Ensure this function is also defined with export const
export const getTiempoJugado = async (req, res, next) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        console.log(`Fetching time played per day for user ID: ${idUsuario} (Last 7 days)`);
        const query = `
            SELECT 
                DATE(fecha_hora) as game_date,  -- Extract only the date part
                SUM(TIME_TO_SEC(duracion_partida)) as total_seconds -- Sum duration in seconds
            FROM estadistica 
            WHERE 
                idUsuario = ? 
                AND fecha_hora >= CURDATE() - INTERVAL 6 DAY -- Filter for last 7 days (including today)
            GROUP BY 
                game_date -- Group by the date
            ORDER BY 
                game_date ASC; -- Order by date ascending
        `;
        const [results] = await pool.query(query, [idUsuario]);

        console.log(`Found ${results.length} daily time records for user ${idUsuario}.`);
        
        // Optional: Format date for consistency if needed, or convert seconds to hours here
        // For now, just return date and total seconds
        const formattedResults = results.map(row => ({
            date: row.game_date.toISOString().split('T')[0], // Format date as YYYY-MM-DD string
            totalSeconds: parseInt(row.total_seconds, 10) || 0 // Ensure it's a number
        }));

        res.status(200).json(formattedResults); // Send the aggregated data

    } catch (error) {
        console.error('Error fetching time played data:', error);
        // Consider sending a more specific error message if possible
        res.status(500).json({ success: false, message: 'Error fetching time played data' });
        // Forward the error to a central error handler if you have one
        // next(error); 
    }
};

// Export ONLY the functions NOT defined with 'export const' individually
export { getStat, recordVictory, recordDefeat };
// getUltimasPartidas should also likely be defined with 'export const' above
// If getUltimasPartidas IS defined with 'export const', remove it from here too.
// Assuming it is for now:
// export { getStat, recordVictory, recordDefeat };