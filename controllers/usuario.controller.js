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

// --- MODIFICADA: Actualizar Preferencia de Avatar (Sticker ID) con Logs Detallados ---
const updateAvatarPreference = async (req, res, next) => {
    const userId = req.userId; // Obtenido del middleware verifyTokenPresence
    const stickerIdFromRequest = req.body.stickerId; // ID del sticker enviado desde el frontend

    // Log inicial de la solicitud
    console.log(`[BEGIN updateAvatarPreference] Received request for userId: ${userId}, stickerIdFromRequest: ${stickerIdFromRequest} (type: ${typeof stickerIdFromRequest})`);

    // Validación del stickerId: debe ser un número entero positivo o null.
    if (stickerIdFromRequest !== null && 
        (!Number.isInteger(stickerIdFromRequest) || stickerIdFromRequest <= 0)) {
        console.error(`[VALIDATION FAIL updateAvatarPreference] Invalid stickerId: ${stickerIdFromRequest}. Must be a positive integer or null.`);
        return res.status(400).json({ success: false, message: 'El stickerId debe ser un número entero positivo o null.' });
    }

    const stickerIdToSave = stickerIdFromRequest; // El valor que realmente se intentará guardar

    console.log(`[PRE-DB updateAvatarPreference] Attempting to update DB for userId: ${userId} with avatar_sticker_id = ${stickerIdToSave}`);

    try {
        const [result] = await pool.query(
            'UPDATE usuario SET avatar_sticker_id = ? WHERE id = ?',
            [stickerIdToSave, userId]
        );

        // Log detallado del resultado de la consulta
        console.log(`[POST-DB updateAvatarPreference] Query executed for userId: ${userId}. Result:`, JSON.stringify(result));

        if (result.affectedRows > 0) {
            console.log(`[SUCCESS updateAvatarPreference] Successfully updated avatar for userId: ${userId} to stickerId: ${stickerIdToSave}. Rows affected: ${result.affectedRows}.`);
            res.json({ success: true, message: 'Preferencia de avatar actualizada.', newStickerId: stickerIdToSave });
        } else {
            // Si no hay filas afectadas, verificar si el usuario existe.
            // Si existe, es probable que el valor ya fuera el que se intentó establecer.
            console.warn(`[INFO updateAvatarPreference] Zero rows affected for userId: ${userId} with stickerId: ${stickerIdToSave}. Checking user existence.`);
            const [userCheck] = await pool.query('SELECT id FROM usuario WHERE id = ?', [userId]);
            if (userCheck.length === 0) {
                console.error(`[NOT FOUND updateAvatarPreference] User with ID ${userId} not found during update attempt.`);
                return res.status(404).json({ success: false, message: 'Usuario no encontrado para actualizar preferencia.' });
            }
            // Si el usuario existe pero no hubo filas afectadas, el valor probablemente ya estaba establecido.
            console.log(`[NO CHANGE updateAvatarPreference] User ${userId} exists, 0 rows affected likely means value was already ${stickerIdToSave}. Treating as success.`);
            res.json({ success: true, message: 'Preferencia de avatar sin cambios (valor ya establecido).', newStickerId: stickerIdToSave });
        }
    } catch (error) {
        console.error(`[DB ERROR updateAvatarPreference] Database error for userId: ${userId}, stickerIdToSave: ${stickerIdToSave}:`, error);
        next(error); // Pasar al manejador de errores global
    }
}
// --- FIN NUEVA FUNCIÓN ---

// Export existing functions AND the new one
export { getUser, createOrGetUser, syncCoinsController, updateAvatarPreference };
