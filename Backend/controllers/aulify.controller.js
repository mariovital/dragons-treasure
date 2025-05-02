import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config(); // Mantener la configuración de dotenv

const AULIFY_API_URL = 'https://www.aulify.mx';
const AULIFY_API_KEY = process.env.AULIFY_API_KEY;

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

export { 
    getCoinsController,
    getLastStickerController
}; 