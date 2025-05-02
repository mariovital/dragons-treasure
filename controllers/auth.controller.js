import axios from 'axios';
import jwt from 'jsonwebtoken';
// import { findOrCreateUser } from './usuario.controller.js';
import { pool } from '../helpers/mysql-config.js';

const AULIFY_LOGIN_URL = 'https://www.aulify.mx/aulifyLogin';
const AULIFY_STICKER_URL = 'https://www.aulify.mx/getLastSticker';
const AULIFY_COINS_URL = 'https://www.aulify.mx/getCoins'; // <--  URL para monedas
const AULIFY_API_KEY = process.env.AULIFY_API_KEY;
// const JWT_SECRET = process.env.KEYPHRASE; // REMOVE - No longer used
const BACKEND_JWT_SECRET = process.env.BACKEND_JWT_SECRET; // ADD - Our secret key

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
    console.warn(`[Monedas Update] No se proporcionó token de Aulify para usuario ID: ${localUserId}. No se pueden actualizar monedas.`);
    return; // Devolver explícitamente para indicar fallo
  }
  //-----------------------------------------
  console.log(`[Monedas Update] Intentando obtener monedas de Aulify para usuario local ID: ${localUserId}`);
  let connection;
  try {
    //------- Llamada a la API de Monedas de Aulify -------
    console.log(`[Monedas Update] Llamando a ${AULIFY_COINS_URL} con token ...${aulifyToken.slice(-5)}`); // Log antes de llamar
    const coinResponse = await axios.get(AULIFY_COINS_URL, { // <-- Usar la URL de monedas
      headers: {
        'X-Api-Key': AULIFY_API_KEY,
        'Authorization': `Bearer ${aulifyToken}` // <-- Asumiendo Bearer token también aquí
      }
    });
    console.log(`[Monedas Update] Respuesta de Aulify /getCoins: Status=${coinResponse.status}, Data=`, coinResponse.data); // Log respuesta
    //-----------------------------------------

    //------- Procesamiento de la Respuesta de Monedas -------
    if (coinResponse.status === 200 && coinResponse.data && typeof coinResponse.data.coins === 'number') {
      const coinCount = parseInt(coinResponse.data.coins, 10); // <-- Extraer 'coins'

      if (!isNaN(coinCount)) {
        console.log(`[Monedas Update] Cantidad de monedas de Aulify: ${coinCount}. Actualizando DB local para usuario ${localUserId}.`);
        //------- Actualización de la Base de Datos Local -------
        connection = await pool.getConnection(); // Obtener conexión
        console.log(`[Monedas Update] Ejecutando UPDATE usuario SET monedas = ${coinCount} WHERE id = ${localUserId}`); // Log SQL
        const [updateResult] = await pool.query(
          'UPDATE usuario SET monedas = ? WHERE id = ?', // <-- Actualizar columna 'monedas'
          [coinCount, localUserId]
        );
        console.log(`[Monedas Update] Resultado del UPDATE en DB local para usuario ${localUserId}:`, updateResult); // Log resultado DB
        return true; // Indicar éxito
        //-----------------------------------------
      } else {
        console.warn('[Monedas Update] No se pudo parsear el campo "coins" como número desde la respuesta de monedas de Aulify:', coinResponse.data);
      }
    } else {
      console.error('[Monedas Update] Respuesta no exitosa o formato inesperado del endpoint de monedas de Aulify:', coinResponse.status, coinResponse.data);
    }
    //-----------------------------------------
  } catch (error) {
    //------- Manejo de Errores (Actualización de Monedas) -------
    console.error(`[Monedas Update] Error al obtener/actualizar monedas para usuario local ID ${localUserId}:`);
    if (axios.isAxiosError(error)) {
      console.error('  Error de Axios:', error.response?.status, error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
         console.error('  Posible problema con el token de Aulify o API Key al llamar a /getCoins.');
      }
    } else {
      console.error('  Error general (ej. DB):', error);
    }
    //-----------------------------------------
  } finally {
     if (connection) {
       connection.release(); // Liberar conexión si se obtuvo
       console.log(`[Monedas Update] Conexión DB liberada para usuario ${localUserId}.`);
     }
  }
  return false; // Indicar fallo si no se completó correctamente
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
            const aulifyData = aulifyResponse.data;
            const aulifyToken = aulifyData.token; // Guardar el token de Aulify

            console.log('[Auth Controller] Successful Aulify API Response Data:', JSON.stringify(aulifyData, null, 2));
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
            let localUserId;

            if (existingUsers.length > 0) {
                // User exists, update name/gamertag/level if necessary
                localUser = existingUsers[0];
                localUserId = localUser.id; // Guardar el ID local
                console.log(`Local user found (ID: ${localUserId}). Checking for updates...`);
                if (localUser.name !== localUserName || localUser.gamertag !== localUserGamertag) {
                   await pool.query("UPDATE usuario SET name = ?, gamertag = ? WHERE id = ?", 
                       [localUserName, localUserGamertag, localUserId]);
                   console.log(`Local user name/gamertag (ID: ${localUserId}) updated.`);
                   // Fetch updated user data
                   const [refreshedUser] = await pool.query("SELECT * FROM usuario WHERE id = ?", [localUserId]);
                   localUser = refreshedUser[0];
                }
            } else {
                // User does not exist, create them
                console.log(`Local user not found for ${localUserEmail}. Creating...`);
                const [insertResult] = await pool.query(
                    "INSERT INTO usuario (email, name, gamertag, monedas, nivel, progreso) VALUES (?, ?, ?, 0, 1, 0)", // Establecer monedas iniciales a 0
                    [localUserEmail, localUserName, localUserGamertag]
                );
                localUserId = insertResult.insertId;
                 console.log(`Local user created with ID: ${localUserId}.`);
                // Fetch the newly created user
                const [newUser] = await pool.query("SELECT * FROM usuario WHERE id = ?", [localUserId]);
                localUser = newUser[0];
            }
            
            // --- INICIO: Obtener y actualizar monedas/stickers DESPUÉS de tener localUserId ---
            // Llamar a las funciones auxiliares pasando el ID local y el token de Aulify
            if (localUserId && aulifyToken) {
                 console.log(`[Auth Controller] Iniciando actualización post-login para usuario ${localUserId}...`);
                 // Ejecutar en paralelo para eficiencia (no esperar una para empezar la otra)
                 await Promise.allSettled([
                     updateUserCoinCount(localUserId, aulifyToken),
                     updateUserStickerCount(localUserId, aulifyToken)
                 ]);
                 console.log(`[Auth Controller] Actualización de monedas/stickers post-login completada (o intentada) para usuario ${localUserId}.`);

                 // Volver a cargar los datos del usuario DESPUÉS de actualizar monedas/stickers
                 const [refreshedUser] = await pool.query("SELECT * FROM usuario WHERE id = ?", [localUserId]);
                 if (refreshedUser.length > 0) {
                    localUser = refreshedUser[0]; // Actualizar localUser con los datos más recientes
                 } else {
                    console.error(`[Auth Controller] ¡Error crítico! No se pudo recargar el usuario ${localUserId} después de la actualización.`);
                    // Manejar este caso improbable pero posible
                 }
            } else {
                 console.warn(`[Auth Controller] No se pudo actualizar monedas/stickers post-login: Falta localUserId (${localUserId}) o aulifyToken (${!!aulifyToken})`);
            }
            // --- FIN: Obtener y actualizar monedas/stickers ---

            // --- Generate OUR backend JWT ---
            if (!BACKEND_JWT_SECRET) {
                console.error('[Auth Controller] Error: BACKEND_JWT_SECRET no está definida en .env');
                // Don't send a token if we can't sign it securely
                return res.status(500).json({ success: false, message: 'Error de configuración interna del servidor [JWT Secret Missing]' });
            }
            
            const payload = { userId: localUserId }; // Usar el ID local obtenido
            const options = { expiresIn: '8h' }; // Set token expiration (e.g., 8 hours)
            const ourJwtToken = jwt.sign(payload, BACKEND_JWT_SECRET, options);
            console.log(`[Auth Controller] Generated our backend JWT for user ID: ${localUserId}`);
            // --- End JWT Generation ---
            
            // Prepare local user data to send back (exclude sensitive info like password hash if it existed)
            const userToSend = localUser ? {
                id: localUser.id,
                email: localUser.email,
                name: localUser.name,
                gamertag: localUser.gamertag,
                monedas: localUser.monedas,
                ultimo_sticker_desbloqueado: localUser.ultimo_sticker_desbloqueado,
                nivel: localUser.nivel,
                progreso: localUser.progreso
            } : null; // Enviar null si hubo error al recargar el usuario

            // --- Log para verificar datos enviados --- 
            console.log('[Auth Controller] User data being sent to frontend:', userToSend);
            // --- Fin Log ---

            // Respond with success, OUR JWT token, Aulify token, and local user data
            res.status(200).json({
                success: true,
                message: 'Login successful',
                token: ourJwtToken, // Send OUR JWT token
                aulifyToken: aulifyToken, // Also send Aulify's token
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