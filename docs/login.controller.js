
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { findOrCreateUser } from './usuarios.controller.js';
import { pool } from '../helpers/mysql-config.js';

const AULIFY_LOGIN_URL = 'https://www.aulify.mx/aulifyLogin';
const AULIFY_STICKER_URL = 'https://www.aulify.mx/getLastSticker';
const AULIFY_COINS_URL = 'https://www.aulify.mx/getCoins'; // <--  URL para monedas
const AULIFY_API_KEY = 'tec_api_KdZRQLUyMEJJHDqztZilqg';
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


//------- Controlador Principal: Inicio de Sesión (doLogin) -------
const doLogin = async (req, res) => {
  try {

    //------- Extracción y Validación de Credenciales -------
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!JWT_SECRET) {
        console.error("FATAL ERROR: La variable de entorno KEYPHRASE (secreto JWT) no está definida.");
        return res.status(500).json({ error: 'Error interno del servidor: Configuración de seguridad incompleta.' });
    }

    console.log(`Attempting login for email: ${email}`);

    //------- 1. Autenticación con Aulify -------
    const aulifyResponse = await axios.post(
      AULIFY_LOGIN_URL,
      { email: email, password: password },
      { headers: { 'X-Api-Key': AULIFY_API_KEY } }
    );
    //-----------------------------------------

    //------- Procesamiento Post-Autenticación Exitosa con Aulify -------
    if (aulifyResponse.status >= 200 && aulifyResponse.status < 300) {
      console.log('Aulify login successful:', aulifyResponse.data);
      const { email: aulifyEmail, token: aulifyToken } = aulifyResponse.data;

      try {
        //------- 2. Buscar o Crear Usuario en DB Local -------
        const localUser = await findOrCreateUser(aulifyEmail);
        console.log(`Usuario ${localUser.email} (ID: ${localUser.id}) asegurado en la base de datos local.`);
        //-----------------------------------------

        //------- Actualización de Stickers (Llamada a Función Auxiliar) -------
        await updateUserStickerCount(localUser.id, aulifyToken);
        //-----------------------------------------

        //------- Actualización de Monedas (Llamada a Nueva Función Auxiliar) -------
        await updateUserCoinCount(localUser.id, aulifyToken); // <-- Llamada a la nueva función
        //-----------------------------------------

        //------- Generación de Nuestro Token JWT -------
        const payload = {
          userId: localUser.id,
          email: localUser.email
        };
        console.log('>>> DEBUG: ID de usuario para JWT:', localUser.id);
        console.log('>>> DEBUG: Payload para JWT:', payload);
        const nuestroTokenJWT = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        console.log(`JWT generado para el usuario ID: ${localUser.id}`);
        //-----------------------------------------

        //------- 3. Envío de Respuesta al Frontend -------
        res.json({
            ...aulifyResponse.data,
            jwtToken: nuestroTokenJWT
        });
        //-----------------------------------------

      } catch (dbError) {
        //------- Manejo de Errores (DB Local, Stickers o Monedas) ------- // <-- Actualizar comentario
        console.error('Error interacting with local database or updating stickers/coins:', dbError); // <-- Actualizar mensaje
         res.status(500).json({
             message: 'Login successful via external service, but failed during local processing.',
             aulifyData: aulifyResponse.data
         });
         //-----------------------------------------
      }
    }
    //-----------------------------------------
  } catch (error) {
    //------- Manejo de Errores (Proceso General de Login / Aulify) -------
    console.error('Error during Aulify login process:');
    if (axios.isAxiosError(error)) {
        //------- Logging Detallado de Errores Axios -------
        console.error('Axios Error Details:');
        if (error.response) {
            console.error(`  Status Code: ${error.response.status}`);
            console.error('  Response Data:', error.response.data);
            console.error('  Response Headers:', error.response.headers);
        } else if (error.request) {
            console.error('  No response received from Aulify. Request details:', error.request);
        } else {
            console.error('  Error setting up Axios request:', error.message);
        }
    } else {
        console.error('Non-Axios Error:', error.message);
    }

    //------- Respuesta de Error al Cliente -------
    if (axios.isAxiosError(error) && error.response) {
      const details = error.response.data || { error: 'Could not connect to authentication service or received empty response.' };
      const responseDetails = typeof details === 'string' ? { error: details } : details;
      res.status(error.response.status).json({
        error: 'Authentication failed via external service.',
        details: responseDetails
      });
    } else {
      res.status(500).json({ error: 'An internal server error occurred during login.' });
    }
  }
};
//-----------------------------------------

//------- Exportaciones -------
export { doLogin };
//-----------------------------------------