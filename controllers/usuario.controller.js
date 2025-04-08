
import { pool } from "../helpers/mysql-config.js"

const getUser = async (req, res) => {
    const { id } = req.params
    console.log("ID recibido:", id)

    try {
        const [results] = await pool.query(`SELECT * FROM Usuario WHERE id = ?`, [id])

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
