

import { pool } from "../helpers/mysql-config.js"

const getStat = async (req, res) => {
    const { idUser } = req.params
    console.log("ID recibido:", idUser)

    try {
        const [results] = await pool.query(`SELECT * FROM Estadistica WHERE idUsuario = ?`, [idUser])

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export { getUser };

