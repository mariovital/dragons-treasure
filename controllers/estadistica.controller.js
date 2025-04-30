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

// Record a victory (assuming idTipo = 1 for 'victorias')
const recordVictory = async (req, res) => {
    // Expect idUsuario in the request body now instead of gamertag
    const { idUsuario } = req.body;
    const idTipoVictoria = 1; // *** ASSUMPTION: idTipo 1 corresponds to 'victorias' ***

    console.log("Record victory request for user ID:", idUsuario);

    if (!idUsuario) {
        return res.status(400).json({ code: 0, message: "User ID (idUsuario) is required" });
    }

    try {
        // Get the current or new statistic entry for victories
        const statEntry = await getOrCreateStatistic(idUsuario, idTipoVictoria);

        // Increment the integer value (number of victories)
        const newValorInt = (statEntry.valor_INT || 0) + 1;
        const now = new Date();

        // Update the statistic entry
        await pool.query(
            "UPDATE estadistica SET valor_INT = ?, fecha_hora = ? WHERE id = ?",
            [newValorInt, now, statEntry.id]
        );

        // Optionally, fetch the updated stats to return
        const [updatedStats] = await pool.query("SELECT * FROM estadistica WHERE idUsuario = ? AND idTipo = ?", [idUsuario, idTipoVictoria]);


        res.json({
            code: 1,
            message: "Victory recorded",
            idUsuario: idUsuario,
            statistic: updatedStats[0] // Return the updated specific statistic
        });
    } catch (err) {
        console.error('Error recording victory:', err);
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

// Export the updated functions
export { getStat, recordVictory, recordDefeat };