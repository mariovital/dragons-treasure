import { pool } from "../helpers/mysql-config.js"
import axios from 'axios';
import 'dotenv/config';

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

const AULIFY_API_URL = 'https://www.aulify.mx';
const AULIFY_API_KEY = process.env.AULIFY_API_KEY;

// Controlador para sincronizar monedas desde Aulify y actualizar la DB local
const syncCoinsController = async (req, res) => {
    const userId = req.userId; // Obtenido del middleware verifyTokenPresence
    const aulifyToken = req.headers['x-aulify-token']; // Token de Aulify enviado por el frontend

    if (!userId) {
        return res.status(401).json({ message: 'No autorizado (Falta userId).' });
    }
    if (!aulifyToken) {
        return res.status(400).json({ message: 'Token de Aulify (X-Aulify-Token header) no encontrado.' });
    }
    if (!AULIFY_API_KEY) {
        console.error("[Sync Coins] AULIFY_API_KEY no está configurada.");
        return res.status(500).json({ message: 'Error interno: Clave API no configurada.' });
    }

    console.log(`[Sync Coins] Iniciando sincronización para usuario ID: ${userId}, Token Aulify: ...${aulifyToken.slice(-5)}`);

    let connection;
    try {
        // 1. Obtener monedas actuales de Aulify
        console.log("[Sync Coins] Llamando a Aulify /getCoins...");
        const aulifyCoinsResponse = await axios.get(`${AULIFY_API_URL}/getCoins`, {
            headers: {
                'Authorization': `Bearer ${aulifyToken}`,
                'X-Api-Key': AULIFY_API_KEY
            }
        });

        if (aulifyCoinsResponse.data && typeof aulifyCoinsResponse.data.coins === 'number') {
            const currentCoins = aulifyCoinsResponse.data.coins;
            console.log(`[Sync Coins] Monedas obtenidas de Aulify: ${currentCoins}`);

            // 2. Actualizar la base de datos local
            connection = await pool.getConnection(); // Assuming pool is available via import
            console.log(`[Sync Coins] Actualizando monedas en DB local para usuario ${userId}...`);
            const [updateResult] = await connection.execute(
                'UPDATE usuario SET monedas = ? WHERE id = ?',
                [currentCoins, userId]
            );

            if (updateResult.affectedRows > 0) {
                console.log(`[Sync Coins] Monedas actualizadas correctamente en DB local para usuario ${userId}.`);
                res.json({ message: 'Monedas sincronizadas correctamente.', coins: currentCoins });
            } else {
                // Esto podría pasar si el userId del token no existe en la DB.
                console.warn(`[Sync Coins] No se encontró al usuario ${userId} en la base de datos para actualizar monedas.`);
                res.status(404).json({ message: 'Usuario no encontrado para actualizar monedas.' });
            }

        } else {
            console.warn(`[Sync Coins] Respuesta inesperada de Aulify /getCoins:`, aulifyCoinsResponse.data);
            res.status(502).json({ message: 'Respuesta inesperada del servicio de monedas.' }); // 502 Bad Gateway
        }

    } catch (error) {
        console.error("[Sync Coins] Error durante la sincronización:", error.response?.data || error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response?.data?.error || 'Error durante la sincronización de monedas.';
        res.status(status).json({ message });
    } finally {
        if (connection) {
            connection.release();
            console.log("[Sync Coins] Conexión a DB liberada.");
        }
    }
};

// Export existing functions AND the new one
export { getUser, createOrGetUser, syncCoinsController };
