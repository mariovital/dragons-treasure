
import { pool } from "../helpers/mysql-config.js"

const getUser = async (req, res) => {
    const { id } = req.params
    console.log("ID recibido:", id)

    try {
        // Query the new 'usuario' table
        const [results] = await pool.query(`SELECT * FROM usuario WHERE id = ?`, [id]) // Changed table name

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }
        // Return the user data based on the new schema (id, email, ultimo_sticker_desbloqueado, monedas)
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

// Modified function to create or get a user by email, matching the NEW DB schema
const createOrGetUser = async (req, res) => {
    // Only email is relevant for finding/creating in the new 'usuario' table structure
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ code: 0, message: "Email is required" });
    }

    try {
        // Check if user exists using the email column in the 'usuario' table
        const [existingUsers] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]); // Changed table name

        if (existingUsers.length > 0) {
            // User exists, return it
            console.log(`User found with email: ${email}`);
            return res.json({
                code: 1,
                message: "User found",
                // Return user data according to the new schema
                user: existingUsers[0]
            });
        }

        // User doesn't exist, create new one
        // Gamertag and level are not part of the new 'usuario' table
        console.log(`Creating new user with email: ${email}`);

        // Insert using only the email column into the 'usuario' table
        const [result] = await pool.query(
            'INSERT INTO usuario (email) VALUES (?)', // Changed table name and columns
            [email]
        );

        const userId = result.insertId;

        // Get the newly created user
        const [newUser] = await pool.query('SELECT * FROM usuario WHERE id = ?', [userId]); // Changed table name

        res.status(201).json({
            code: 1,
            message: "User created successfully",
            // Return the newly created user data
            user: newUser[0]
        });
    } catch (err) {
        console.error('Error creating/getting user by email:', err);
        res.status(500).json({ code: 0, message: "Error interno del servidor" });
    }
}

export { getUser, createOrGetUser };
