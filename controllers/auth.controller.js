import axios from 'axios';
// import jwt from 'jsonwebtoken';
// import { findOrCreateUser } from './usuario.controller.js';
import { pool } from '../helpers/mysql-config.js';

const AULIFY_LOGIN_URL = 'https://www.aulify.mx/aulifyLogin';
const AULIFY_STICKER_URL = 'https://www.aulify.mx/getLastSticker';
const AULIFY_COINS_URL = 'https://www.aulify.mx/getCoins'; // <--  URL para monedas
const AULIFY_API_KEY = process.env.AULIFY_API_KEY;
const JWT_SECRET = process.env.KEYPHRASE;

//------- Función Auxiliar: Actualizar Stickers del Usuario -------
const updateUserStickerCount = async (localUserId, aulifyToken) => {
  
  //------- Verificación del Token de Aulify -------
  if (!aulifyToken) {
    console.warn(`[Stickers] No se proporcionó token de Aulify para usuario ID: ${localUserId}. No se pueden actualizar stickers.`);
    return;
  }
  console.log(`[Stickers] Intentando obtener stickers de Aulify para usuario local ID: ${localUserId}`);
  try {
    
    //------- Llamada a la API de Stickers de Aulify -------
    const stickerResponse = await axios.get(AULIFY_STICKER_URL, {
      headers: {
        'X-Api-Key': AULIFY_API_KEY,
        'Authorization': `Bearer ${aulifyToken}`
      }
    });

    //------- Procesamiento de la Respuesta de Stickers -------
    if (stickerResponse.status === 200 && stickerResponse.data) {
      const ultimoStickerId = parseInt(stickerResponse.data.id, 10);

      if (!isNaN(ultimoStickerId)) {
        console.log(`[Stickers] Último sticker ID de Aulify: ${ultimoStickerId}. Actualizando DB local para usuario ${localUserId}.`);
        
        //------- Actualización de la Base de Datos Local -------
        await pool.query(
          'UPDATE usuario SET ultimo_sticker_desbloqueado = ? WHERE id = ?',
          [ultimoStickerId, localUserId]
        );
        console.log(`[Stickers] DB local actualizada para usuario ${localUserId}.`);
      } else {
        console.warn('[Stickers] No se pudo parsear el campo "id" como número desde la respuesta de stickers de Aulify:', stickerResponse.data);
      }
    } else {
      console.error('[Stickers] Respuesta no exitosa del endpoint de stickers de Aulify:', stickerResponse.status, stickerResponse.data);
    }
  } catch (error) {

    //------- Manejo de Errores (Actualización de Stickers) -------
    console.error(`[Stickers] Error al obtener/actualizar stickers para usuario local ID ${localUserId}:`);
    if (axios.isAxiosError(error)) {
      console.error('  Error de Axios:', error.response?.status, error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
         console.error('  Posible problema con el token de Aulify o API Key al llamar a /getLastSticker. Verifica cómo Aulify espera el token.');
      }
    } else {
      console.error('  Error general (ej. DB):', error);
    }
  }
};
//-----------------------------------------

//------- Función Auxiliar: Actualizar Monedas del Usuario -------
const updateUserCoinCount = async (localUserId, aulifyToken) => {
  //------- Verificación del Token de Aulify -------
  if (!aulifyToken) {
    console.warn(`[Monedas] No se proporcionó token de Aulify para usuario ID: ${localUserId}. No se pueden actualizar monedas.`);
    return;
  }
  //-----------------------------------------
  console.log(`[Monedas] Intentando obtener monedas de Aulify para usuario local ID: ${localUserId}`);
  try {
    //------- Llamada a la API de Monedas de Aulify -------
    const coinResponse = await axios.get(AULIFY_COINS_URL, { // <-- Usar la URL de monedas
      headers: {
        'X-Api-Key': AULIFY_API_KEY,
        'Authorization': `Bearer ${aulifyToken}` // <-- Asumiendo Bearer token también aquí
      }
    });
    //-----------------------------------------

    //------- Procesamiento de la Respuesta de Monedas -------
    if (coinResponse.status === 200 && coinResponse.data && typeof coinResponse.data.coins !== 'undefined') {
      const coinCount = parseInt(coinResponse.data.coins, 10); // <-- Extraer 'coins'

      if (!isNaN(coinCount)) {
        console.log(`[Monedas] Cantidad de monedas de Aulify: ${coinCount}. Actualizando DB local para usuario ${localUserId}.`);
        //------- Actualización de la Base de Datos Local -------
        // Asegúrate que la columna en tu tabla 'usuario' se llame 'monedas'
        await pool.query(
          'UPDATE usuario SET monedas = ? WHERE id = ?', // <-- Actualizar columna 'monedas'
          [coinCount, localUserId]
        );
        console.log(`[Monedas] DB local actualizada para usuario ${localUserId}.`);
        //-----------------------------------------
      } else {
        console.warn('[Monedas] No se pudo parsear el campo "coins" como número desde la respuesta de monedas de Aulify:', coinResponse.data);
      }
    } else {
      console.error('[Monedas] Respuesta no exitosa o formato inesperado del endpoint de monedas de Aulify:', coinResponse.status, coinResponse.data);
    }
    //-----------------------------------------
  } catch (error) {
    //------- Manejo de Errores (Actualización de Monedas) -------
    console.error(`[Monedas] Error al obtener/actualizar monedas para usuario local ID ${localUserId}:`);
    if (axios.isAxiosError(error)) {
      console.error('  Error de Axios:', error.response?.status, error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
         console.error('  Posible problema con el token de Aulify o API Key al llamar a /getCoins.');
      }
    } else {
      console.error('  Error general (ej. DB):', error);
    }
    //-----------------------------------------
  }
};
//-----------------------------------------

// --- Login Handler ---
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    if (!AULIFY_API_KEY) {
        console.error('Error: AULIFY_API_KEY is not defined in environment variables.');
        return res.status(500).json({ success: false, message: 'Server configuration error [API Key Missing]' });
    }

    try {
        console.log(`Attempting login for ${email} via Aulify API...`);

        // --- Call Aulify API ---
        const aulifyResponse = await axios.post(AULIFY_LOGIN_URL, {
            email: email,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': AULIFY_API_KEY
            },
            // Crucial: Don't throw for non-2xx status codes, handle them manually
            validateStatus: function (status) {
                return status < 500; // Accept all status codes below 500 (including 4xx)
            }
        });

        console.log(`Aulify API response status: ${aulifyResponse.status}`);
        // console.log("Aulify response data:", aulifyResponse.data); // Log raw response if needed

        // --- Handle Aulify Response ---
        if (aulifyResponse.status === 200 && aulifyResponse.data?.token) {
            // Successful login via Aulify
            const aulifyData = aulifyResponse.data;
            
            // --- Log DETALLADO de la respuesta de Aulify --- 
            console.log('[Auth Controller] Successful Aulify API Response Data:', JSON.stringify(aulifyData, null, 2));
            // --- Fin Log Detallado ---

            console.log(`Aulify login successful for ${email}.`);
            
            // --- Find or Create User Locally ---
            const localUserEmail = aulifyData.email; 
            const localUserName = aulifyData.name; 
            const localUserLevel = aulifyData.level; // Assuming Aulify still returns level directly
            
            // Extract first name for gamertag
            const localUserGamertag = localUserName ? localUserName.split(' ')[0] : 'User'; 

            // Check if user exists locally
            const [existingUsers] = await pool.query("SELECT * FROM usuario WHERE email = ?", [localUserEmail]);
            let localUser;

            if (existingUsers.length > 0) {
                // User exists, update name/gamertag/level if necessary
                localUser = existingUsers[0];
                console.log(`Local user found (ID: ${localUser.id}). Checking for updates...`);
                if (localUser.name !== localUserName || localUser.gamertag !== localUserGamertag) {
                   await pool.query("UPDATE usuario SET name = ?, gamertag = ? WHERE id = ?", 
                       [localUserName, localUserGamertag, localUser.id]);
                   console.log(`Local user (ID: ${localUser.id}) updated.`);
                   // Fetch updated user data
                   const [refreshedUser] = await pool.query("SELECT * FROM usuario WHERE id = ?", [localUser.id]);
                   localUser = refreshedUser[0];
                }
            } else {
                // User does not exist, create them
                console.log(`Local user not found for ${localUserEmail}. Creating...`);
                const [insertResult] = await pool.query(
                    "INSERT INTO usuario (email, name, gamertag) VALUES (?, ?, ?)", 
                    [localUserEmail, localUserName, localUserGamertag]
                );
                const newUserId = insertResult.insertId;
                 console.log(`Local user created with ID: ${newUserId}.`);
                // Fetch the newly created user
                const [newUser] = await pool.query("SELECT * FROM usuario WHERE id = ?", [newUserId]);
                localUser = newUser[0];
            }
            
            // Prepare local user data to send back (exclude sensitive info like password hash if it existed)
            const userToSend = {
                id: localUser.id,
                email: localUser.email,
                name: localUser.name,
                gamertag: localUser.gamertag,
                monedas: localUser.monedas,
                ultimo_sticker_desbloqueado: localUser.ultimo_sticker_desbloqueado,
                nivel: localUser.nivel,
                progreso: localUser.progreso
            };

            // --- Log para verificar datos enviados --- 
            console.log('[Auth Controller] User data being sent to frontend:', userToSend);
            // --- Fin Log ---

            // Respond with success, Aulify token, and local user data
            res.status(200).json({
                success: true,
                message: 'Login successful',
                token: aulifyData.token, // The token from Aulify
                user: userToSend // Local user data
            });

        } else {
            // Failed login via Aulify (e.g., 401, 400, 404)
            const errorMessage = aulifyResponse.data?.message || 'Aulify authentication failed';
             console.warn(`Aulify login failed for ${email}. Status: ${aulifyResponse.status}, Message: ${errorMessage}`);
             
            // --- Specific error message for bad credentials ---
            // Check common status codes or message contents indicating bad credentials
            // Updated to include 404 based on Postman test for this specific API
            if (aulifyResponse.status === 401 || aulifyResponse.status === 400 || aulifyResponse.status === 404 || (errorMessage && errorMessage.toLowerCase().includes('invalid email or password'))) {
                 return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' }); // Return 401 from OUR API
            } else {
                 // Generic Aulify failure message for other errors
                 return res.status(aulifyResponse.status || 400).json({ success: false, message: errorMessage });
             }
        }

    } catch (error) {
        // Handle network errors or unexpected issues during the process
        console.error(`Critical error during login process for ${email}:`, error);
        // Avoid leaking detailed error info unless necessary for debugging
        res.status(500).json({ success: false, message: 'An internal server error occurred during login.' });
        // next(error); // Optionally pass to an error handling middleware
    }
};

// Add other auth-related functions here if needed (e.g., register, logout)