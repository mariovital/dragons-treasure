import axios from 'axios';
import dotenv from 'dotenv';
import { pool } from '../../helpers/mysql-config.js'; // <-- Importar pool

dotenv.config(); // Mantener la configuración de dotenv

const AULIFY_API_URL = 'https://www.aulify.mx';
const AULIFY_API_KEY = process.env.AULIFY_API_KEY;
const AULIFY_ADD_COINS_URL = `${AULIFY_API_URL}/addCoins`; // URL específica

// Controlador para obtener las monedas del usuario desde Aulify
const getCoinsController = async (req, res) => {
    // Read Aulify token from the custom header sent by frontend
    const aulifyToken = req.headers['x-aulify-token']; 

    if (!aulifyToken) {
        // Adjusted error message
        return res.status(400).json({ message: 'Token de Aulify (X-Aulify-Token header) no encontrado en la solicitud.' });
    }
     if (!AULIFY_API_KEY) {
        console.error("[Aulify Controller] AULIFY_API_KEY no está configurada en .env");
        return res.status(500).json({ message: 'Error interno del servidor: Clave API no configurada.' });
    }

    console.log(`[Aulify Controller] Intentando obtener monedas para el token: ...${aulifyToken.slice(-5)}`);

    try {
        const response = await axios.get(`${AULIFY_API_URL}/getCoins`, {
            headers: {
                'Authorization': `Bearer ${aulifyToken}`, // Asegúrate que Aulify espera "Bearer" si es necesario
                'X-Api-Key': AULIFY_API_KEY
            }
        });

        console.log("[Aulify Controller] Respuesta de /getCoins:", response.data);
        // Asumiendo que la respuesta exitosa tiene una estructura como { coins: 123 }
        res.json(response.data); 

    } catch (error) {
        console.error("[Aulify Controller] Error al llamar a /getCoins:", error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response && error.response.data && error.response.data.error 
                        ? error.response.data.error 
                        : 'Error al obtener las monedas desde Aulify.';
        res.status(status).json({ message });
    }
};

// Controlador para obtener el último sticker del usuario desde Aulify
const getLastStickerController = async (req, res) => {
    // Read Aulify token from the custom header sent by frontend
    const aulifyToken = req.headers['x-aulify-token']; 

     if (!aulifyToken) {
        // Adjusted error message
        return res.status(400).json({ message: 'Token de Aulify (X-Aulify-Token header) no encontrado en la solicitud.' });
    }
     if (!AULIFY_API_KEY) {
        console.error("[Aulify Controller] AULIFY_API_KEY no está configurada en .env");
        return res.status(500).json({ message: 'Error interno del servidor: Clave API no configurada.' });
    }

    console.log(`[Aulify Controller] Intentando obtener último sticker para el token: ...${aulifyToken.slice(-5)}`);

    try {
        const response = await axios.get(`${AULIFY_API_URL}/getLastSticker`, {
            headers: {
                'Authorization': `Bearer ${aulifyToken}`, // Asegúrate que Aulify espera "Bearer" si es necesario
                'X-Api-Key': AULIFY_API_KEY
            }
        });

        console.log("[Aulify Controller] Respuesta de /getLastSticker:", response.data);
        // Asumiendo que la respuesta exitosa tiene una estructura como { name: "...", description: "...", image: "..." }
        // Si Aulify devuelve un objeto con 'error' (ej. "No stickers found"), lo pasamos tal cual
        if (response.data && response.data.error && response.data.error === "No stickers found") {
             console.log("[Aulify Controller] No se encontraron stickers para el usuario.");
             // Devolvemos null para que el frontend sepa que no hay sticker
             res.json({ sticker: null }); 
        } else {
            // Devolvemos el objeto sticker dentro de una clave 'sticker' para consistencia
            res.json({ sticker: response.data });
        }

    } catch (error) {
        console.error("[Aulify Controller] Error al llamar a /getLastSticker:", error.response ? error.response.data : error.message);
        
        // Manejo específico si el error es "No stickers found" pero viene como error HTTP (ej. 404)
        if (error.response && error.response.status === 404 && error.response.data && error.response.data.error === "No stickers found") {
             console.log("[Aulify Controller] No se encontraron stickers para el usuario (detectado por 404).");
             res.json({ sticker: null }); // Devolver null igualmente
        } else {
            const status = error.response ? error.response.status : 500;
            const message = error.response && error.response.data && error.response.data.error 
                            ? error.response.data.error 
                            : 'Error al obtener el último sticker desde Aulify.';
            res.status(status).json({ message });
        }
    }
};

// --- NEW: Controlador para AÑADIR monedas via Aulify API ---
const addCoinsController = async (req, res, next) => {
    const userId = req.userId; // De nuestro middleware JWT
    const aulifyToken = req.headers['x-aulify-token']; // Token de Aulify
    const { coinsToAdd } = req.body; // Monedas a añadir

    // --- Validaciones ---
    if (!userId) {
        return res.status(401).json({ success: false, message: 'No autorizado (Falta userId de token JWT).' });
    }
    if (!aulifyToken) {
        return res.status(400).json({ success: false, message: 'Token de Aulify (X-Aulify-Token header) no encontrado.' });
    }
    if (!AULIFY_API_KEY) {
        console.error("[Add Coins] AULIFY_API_KEY no está configurada.");
        return res.status(500).json({ success: false, message: 'Error interno del servidor (API Key faltante).' });
    }
    if (typeof coinsToAdd !== 'number' || coinsToAdd <= 0) {
        return res.status(400).json({ success: false, message: 'El campo "coinsToAdd" debe ser un número positivo.' });
    }
    // --- Fin Validaciones ---

    console.log(`[Add Coins] Usuario ${userId} intentando añadir ${coinsToAdd} monedas via Aulify.`);

    let connection;
    try {
        // 1. Llamar a la API de Aulify para añadir monedas
        console.log(`[Add Coins] Llamando a POST ${AULIFY_ADD_COINS_URL} para usuario ${userId}`);
        const aulifyResponse = await axios.post(AULIFY_ADD_COINS_URL, 
            { coins: coinsToAdd }, // Cuerpo de la petición a Aulify
            {
                headers: {
                    'Authorization': `Bearer ${aulifyToken}`,
                    'X-Api-Key': AULIFY_API_KEY,
                    'Content-Type': 'application/json' // Asegurar Content-Type
                }
            }
        );

        // Verificar respuesta exitosa de Aulify (asumiendo 2xx y que devuelve el nuevo total)
        if (aulifyResponse.status >= 200 && aulifyResponse.status < 300 && aulifyResponse.data && typeof aulifyResponse.data.coins === 'number') {
            const newTotalCoins = aulifyResponse.data.coins;
            console.log(`[Add Coins] Aulify respondió con éxito. Nuevo total: ${newTotalCoins}. Actualizando DB local para usuario ${userId}...`);

            // 2. Actualizar la base de datos local con el nuevo total
            connection = await pool.getConnection();
            const [updateResult] = await connection.query(
                'UPDATE usuario SET monedas = ? WHERE id = ?',
                [newTotalCoins, userId]
            );
            connection.release(); // Liberar conexión

            if (updateResult.affectedRows > 0) {
                console.log(`[Add Coins] DB local actualizada para usuario ${userId}.`);
                // 3. Responder al cliente con éxito
                res.json({ success: true, message: 'Monedas añadidas con éxito.', newTotalCoins: newTotalCoins });
            } else {
                 // Esto no debería pasar si el userId es válido, pero es un chequeo de seguridad
                 console.warn(`[Add Coins] Aulify OK, pero no se encontró/actualizó el usuario ${userId} en la DB local.`);
                 res.status(404).json({ success: false, message: 'Usuario no encontrado en la base de datos local después de añadir monedas.' });
            }
        } else {
            // Caso: Aulify respondió pero no como se esperaba (ej. 200 OK pero sin {coins: number})
             console.error(`[Add Coins] Respuesta inesperada de Aulify: Status ${aulifyResponse.status}, Data:`, aulifyResponse.data);
             // Responder con un error genérico o más específico si se puede determinar
             res.status(502).json({ success: false, message: 'Respuesta inesperada desde el servicio de monedas.' });
        }

    } catch (error) {
        if (connection) connection.release(); // Asegurar liberación si la conexión se obtuvo antes del error

        console.error(`[Add Coins] Error al intentar añadir monedas para usuario ${userId}:`, error.response ? { status: error.response.status, data: error.response.data } : error.message);

        // Intentar dar un mensaje de error más útil basado en la respuesta de Aulify
        if (error.response && error.response.data) {
            // Si Aulify devuelve un error específico como { "error": "failed" }
            const aulifyErrorMessage = error.response.data.error || error.response.data.message || 'Error desconocido de Aulify';
            res.status(error.response.status || 502).json({ success: false, message: `Error desde Aulify: ${aulifyErrorMessage}` });
        } else {
            // Error de red u otro error
            res.status(500).json({ success: false, message: 'Error interno al procesar la solicitud de añadir monedas.' });
        }
        // No llamamos a next(error) aquí para controlar la respuesta directamente
    }
};

export { 
    getCoinsController,
    getLastStickerController,
    addCoinsController // Exportar el nuevo controlador
}; 