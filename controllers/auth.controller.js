import axios from 'axios';
import jwt from 'jsonwebtoken';
// import { findOrCreateUser } from './usuario.controller.js';
import { pool } from '../helpers/mysql-config.js';
import bcrypt from 'bcryptjs'; // Opcional: si manejarás contraseñas propias

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
            const localUserGamertag = localUserName ? localUserName.split(' ')[0] : 'User'; 
            
            // --- MODIFICADO: Especificar columnas y añadir role y avatar_sticker_id ---
            const selectColumns = 'id, email, name, gamertag, role, nivel, progreso, monedas, avatar_sticker_id'; 
            const [existingUsers] = await pool.query(`SELECT ${selectColumns} FROM usuario WHERE email = ?`, [localUserEmail]);
            // --- FIN MODIFICADO ---
            
            let localUser;
            let localUserId;
            let userRole; // <-- Variable para guardar el rol

            if (existingUsers.length > 0) {
                localUser = existingUsers[0];
                localUserId = localUser.id;
                userRole = localUser.role; // <-- Guardar rol existente
                console.log(`Local user found (ID: ${localUserId}, Role: ${userRole}). Checking for updates...`);
                
                // --- MODIFICADO: Actualizar name/gamertag si es necesario ---
                if (localUser.name !== localUserName || localUser.gamertag !== localUserGamertag) {
                   await pool.query("UPDATE usuario SET name = ?, gamertag = ? WHERE id = ?", 
                       [localUserName, localUserGamertag, localUserId]);
                   console.log(`Local user name/gamertag (ID: ${localUserId}) updated.`);
                   // No necesitamos recargar aquí, ya tenemos el ID y rol, y las monedas/stickers se recargan después
                }
                // --- FIN MODIFICADO ---
            } else {
                // User does not exist, create them
                console.log(`Local user not found for ${localUserEmail}. Creating...`);
                // El rol tomará el valor por defecto 'user' de la BD
                const [insertResult] = await pool.query(
                    "INSERT INTO usuario (email, name, gamertag, monedas, nivel, progreso) VALUES (?, ?, ?, 0, 1, 0)",
                    [localUserEmail, localUserName, localUserGamertag]
                );
                localUserId = insertResult.insertId;
                userRole = 'user'; // <-- Asignar rol por defecto
                console.log(`Local user created with ID: ${localUserId}, Role: ${userRole}.`);
                 // No necesitamos recargar aquí tampoco
            }
            
            // --- INICIO: Obtener y actualizar monedas/stickers ---
            if (localUserId && aulifyToken) {
                 console.log(`[Auth Controller] Iniciando actualización post-login para usuario ${localUserId}...`);
                 // Ejecutar en paralelo para eficiencia (no esperar una para empezar la otra)
                 await Promise.allSettled([
                     updateUserCoinCount(localUserId, aulifyToken),
                     updateUserStickerCount(localUserId, aulifyToken)
                 ]);
                 console.log(`[Auth Controller] Actualización de monedas/stickers post-login completada (o intentada) para usuario ${localUserId}.`);
                 // --- MODIFICADO: Volver a cargar los datos incluyendo el ROL y avatar_sticker_id ---
                 const [refreshedUserResult] = await pool.query(`SELECT ${selectColumns} FROM usuario WHERE id = ?`, [localUserId]);
                 if (refreshedUserResult.length > 0) {
                    localUser = refreshedUserResult[0]; // Actualizar localUser con los datos más recientes (incluye avatar_sticker_id)
                    userRole = localUser.role; // Asegurar que userRole esté actualizado
                 } else {
                    console.error(`[Auth Controller] ¡Error crítico! No se pudo recargar el usuario ${localUserId} después de la actualización.`);
                    // Considerar devolver un error aquí
                 }
                 // --- FIN MODIFICADO ---
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
            
            // --- MODIFICADO: Añadir ROL y avatar_sticker_id al payload --- 
            const payload = {
                userId: localUserId,
                email: localUserEmail,
                role: userRole, // <-- Incluir rol
                avatarStickerId: localUser?.avatar_sticker_id // <-- Incluir ID del sticker (puede ser null)
            };
            // --- FIN MODIFICADO ---
            
            const options = { expiresIn: '24h' }; 
            const ourJwtToken = jwt.sign(payload, BACKEND_JWT_SECRET, options);
            console.log(`[Auth Controller] Generated our backend JWT for user ID: ${localUserId} with role: ${userRole}`);

            // --- Prepare user data to send to frontend ---
            // --- MODIFICADO: Añadir ROL a userToSend --- 
            const userToSend = {
                id: localUser.id,
                email: localUser.email,
                name: localUser.name,
                gamertag: localUser.gamertag,
                role: localUser.role, // <-- ROL AÑADIDO
                nivel: localUser.nivel,
                progreso: localUser.progreso,
                monedas: localUser.monedas, // Asegurar que esto se cargó después de sync
                avatar_sticker_id: localUser.avatar_sticker_id, // <-- MUY IMPORTANTE AÑADIR ESTO
                // ultimo_sticker_desbloqueado: localUser.ultimo_sticker_desbloqueado // Opcional si el frontend lo necesita
            };
            console.log("[Auth Controller] Sending user data to frontend:", userToSend);
            // --- FIN MODIFICADO ---

            res.json({ success: true, token: ourJwtToken, aulifyToken, user: userToSend });
        
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

// Controlador para establecer sesión después del login de Aulify
export const establishSessionController = async (req, res, next) => {
    const { email, aulifyUsername } = req.body; // aulifyUsername es opcional pero útil

    if (!email) {
        return res.status(400).json({ success: false, message: 'El email es requerido.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        
        // 1. Buscar usuario por email en tu base de datos
        const [users] = await connection.query('SELECT id, email, gamertag, nivel, progreso FROM usuario WHERE email = ?', [email]);
        let user;
        let newUserData = null;

        if (users.length > 0) {
            user = users[0];
            console.log(`[Auth Establish] Usuario encontrado en DB local: ${user.id} - ${user.email}`);
        } else {
            // 2. Si el usuario no existe, crearlo (ajusta según tu modelo de datos)
            console.log(`[Auth Establish] Usuario con email ${email} no encontrado. Creando nuevo usuario...`);
            
            // Decisiones a tomar aquí:
            // - ¿Gamertag default? ¿Se usa aulifyUsername?
            // - ¿Password? Si Aulify es la fuente de verdad, quizás no necesites un password aquí.
            //   O podrías generar uno aleatorio no usable, o pedir que se establezca luego.
            // - ¿Nivel y progreso iniciales?
            const defaultGamertag = aulifyUsername || email.split('@')[0]; // Ejemplo de gamertag
            const defaultNivel = 1;
            const defaultProgreso = 0;
            // Si tienes una columna de password y es NOT NULL, necesitarás manejarla.
            // Ejemplo simple: const placeholderPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

            const [insertResult] = await connection.query(
                'INSERT INTO usuario (email, gamertag, nivel, progreso, total_victorias, total_derrotas, total_partidas, role) VALUES (?, ?, ?, ?, 0, 0, 0, \'user\')',
                // Asegúrate que los campos coincidan con tu tabla `usuario`
                [email, defaultGamertag, defaultNivel, defaultProgreso]
            );

            if (insertResult.insertId) {
                user = { 
                    id: insertResult.insertId, 
                    email: email,
                    gamertag: defaultGamertag,
                    nivel: defaultNivel,
                    progreso: defaultProgreso
                };
                newUserData = user; // Para indicar que se creó
                console.log(`[Auth Establish] Nuevo usuario creado con ID: ${user.id}`);
            } else {
                throw new Error('No se pudo crear el usuario en la base de datos local.');
            }
        }

        // 3. Generar tu propio token JWT
        const payload = {
            userId: user.id, // ID de tu tabla usuario
            email: user.email
        };
        const yourAuthToken = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } // Configura la expiración como necesites
        );

        console.log(`[Auth Establish] Token JWT propio generado para usuario ID: ${user.id}`);
        
        res.status(newUserData ? 201 : 200).json({
            success: true,
            message: newUserData ? 'Usuario creado y sesión establecida.' : 'Sesión establecida.',
            token: yourAuthToken,
            userId: user.id,
            gamertag: user.gamertag,
            nivel: user.nivel,
            progreso: user.progreso,
            // Puedes añadir cualquier otro dato del usuario que Unity necesite
        });

    } catch (error) {
        console.error('[Auth Establish] Error estableciendo sesión:', error);
        next(error); // Pasa al manejador de errores global
    } finally {
        if (connection) connection.release();
    }
};

// Add other auth-related functions here if needed (e.g., register, logout)