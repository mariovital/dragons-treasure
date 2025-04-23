
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

// Modified function to create or get a user by email, matching DB schema
const createOrGetUser = async (req, res) => {
    // Destructure email, name, and level from the request body
    const { email, name, level } = req.body;

    if (!email) {
        return res.status(400).json({ code: 0, message: "Email is required" });
    }

    try {
        // Check if user exists using the dedicated email column
        const [existingUsers] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            // User exists, return it
            console.log(`User found with email: ${email}`);
            return res.json({
                code: 1,
                message: "User found",
                user: existingUsers[0]
            });
        }

        // User doesn't exist, create new one
        // Use the provided name for the gamertag column, fallback to email if name is missing
        const userGamertag = name || email;
        // Use the provided level, fallback to 0 or null if appropriate for your DB default
        const userLevel = level || 0; // Assuming 0 is a sensible default if level is missing

        console.log(`Creating new user with email: ${email}, gamertag: ${userGamertag}, level: ${userLevel}`);

        // Insert using the correct columns: email, gamertag, nivel
        const [result] = await pool.query(
            'INSERT INTO Usuario (email, gamertag, nivel) VALUES (?, ?, ?)',
            [email, userGamertag, userLevel]
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
        console.error('Error creating/getting user by email:', err);
        res.status(500).json({ code: 0, message: "Error interno del servidor" });
    }
}

export { getUser, createOrGetUser };
