
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

// New function to create or get a user by gamertag
const createOrGetUser = async (req, res) => {
    const { gamertag, nombre } = req.body;
    
    if (!gamertag) {
        return res.status(400).json({ code: 0, message: "Gamertag is required" });
    }
    
    try {
        // Check if user exists
        const [existingUsers] = await pool.query('SELECT * FROM Usuario WHERE gamertag = ?', [gamertag]);
        
        if (existingUsers.length > 0) {
            // User exists, return it
            return res.json({
                code: 1,
                message: "User found",
                user: existingUsers[0]
            });
        }
        
        // User doesn't exist, create new one
        const userName = nombre || gamertag; // Use provided name or gamertag as fallback
        const [result] = await pool.query(
            'INSERT INTO Usuario (gamertag, nombre) VALUES (?, ?)',
            [gamertag, userName]
        );
        
        const userId = result.insertId;
        
        // Get the newly created user
        const [newUser] = await pool.query('SELECT * FROM Usuario WHERE id = ?', [userId]);
        
        res.status(201).json({
            code: 1,
            message: "User created successfully",
            user: newUser[0]
        });
    } catch (err) {
        console.error('Error creating/getting user:', err);
        res.status(500).json({ code: 0, message: "Error interno del servidor" });
    }
}

export { getUser, createOrGetUser };
