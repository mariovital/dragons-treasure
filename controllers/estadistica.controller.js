import { pool } from '../helpers/mysql-config.js';


async function getUserId(gamertag) {
    const [rows] = await pool.query("SELECT id FROM Usuario WHERE gamertag = ?", [gamertag]);
    return rows.length > 0 ? rows[0].id : null;
}


async function getStatsByUserId(idUsuario) {
    const [rows] = await pool.query("SELECT * FROM Estadistica WHERE idUsuario = ?", [idUsuario]);
    return rows.length ? rows[0] : null;
}


const getStat = async (req, res) => {
    const { idUser } = req.params;
    console.log("ID recibido:", idUser);

    try {
        const [results] = await pool.query(`SELECT * FROM Estadistica WHERE idUsuario = ?`, [idUser]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const recordVictory = async (req, res) => {
    const { gamertag } = req.body;

    if (!gamertag) {
        return res.status(400).json({ code: 0, message: "Gamertag is required" });
    }

    try {
        const userId = await getUserId(gamertag);
        if (!userId) return res.status(404).json({ code: 0, message: "User not found" });

        const stats = await getStatsByUserId(userId);

        if (stats) {
            await pool.query("UPDATE Estadistica SET victorias = victorias + 1 WHERE idUsuario = ?", [userId]);
        } else {
            await pool.query("INSERT INTO Estadistica (idUsuario, victorias, derrotas) VALUES (?, 1, 0)", [userId]);
        }

        const updated = await getStatsByUserId(userId);

        res.json({
            code: 1,
            message: "Victory recorded",
            name: gamertag,
            totalVictories: updated.victorias,
            totalDefeats: updated.derrotas
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: "Error recording victory" });
    }
};


const recordDefeat = async (req, res) => {
    const { gamertag } = req.body;

    if (!gamertag) {
        return res.status(400).json({ code: 0, message: "Gamertag is required" });
    }

    try {
        const userId = await getUserId(gamertag);
        if (!userId) return res.status(404).json({ code: 0, message: "User not found" });

        const stats = await getStatsByUserId(userId);

        if (stats) {
            await pool.query("UPDATE Estadistica SET derrotas = derrotas + 1 WHERE idUsuario = ?", [userId]);
        } else {
            await pool.query("INSERT INTO Estadistica (idUsuario, victorias, derrotas) VALUES (?, 0, 1)", [userId]);
        }

        const updated = await getStatsByUserId(userId);

        res.json({
            code: 1,
            message: "Defeat recorded",
            name: gamertag,
            totalVictories: updated.victorias,
            totalDefeats: updated.derrotas
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: "Error recording defeat" });
    }
};

export { getStat, recordVictory, recordDefeat };