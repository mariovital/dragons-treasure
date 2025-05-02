import jwt from 'jsonwebtoken';
import { pool } from '../../helpers/mysql-config.js'; // Correct path from Backend/middleware to root/helpers
import 'dotenv/config'; // Para cargar AULIFY_JWT_SECRET

const verifyTokenPresence = async (req, res, next) => { // Convertir a async si buscamos por email
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("[Auth Middleware] Token missing or invalid format.");
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado o inválido.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
      console.warn("[Auth Middleware] Token extracted is empty.");
      return res.status(401).json({ message: 'Acceso denegado. Token vacío.' });
  }

  try {
    // Verificar y decodificar el token JWT
    const secret = process.env.BACKEND_JWT_SECRET;
    if (!secret) {
        console.error("[Auth Middleware] Error: BACKEND_JWT_SECRET no está definida en .env");
        return res.status(500).json({ message: 'Error de configuración interna del servidor.' });
    }

    const decoded = jwt.verify(token, secret);

    // --- Extraer el ID del usuario del payload decodificado ---
    // Ajusta 'user_id' al nombre real del campo en el payload del token de Aulify -> Use 'userId' (camelCase) as defined in auth.controller
    const userIdFromToken = decoded.userId; 

    if (!userIdFromToken) {
        // Adjust error message if needed
        console.error("[Auth Middleware] Error: El payload del token no contiene 'userId'. Payload:", decoded); 
        return res.status(401).json({ message: 'Token inválido o malformado.' });
    }

    // (Opcional: Si el token contiene email en lugar de ID)
    /*
    const userEmailFromToken = decoded.email;
    if (!userEmailFromToken) {
        console.error("[Auth Middleware] Error: El payload del token no contiene 'email'.");
        return res.status(401).json({ message: 'Token inválido o malformado.' });
    }
    // Buscar el idUsuario en tu base de datos
    const [users] = await pool.query('SELECT id FROM usuario WHERE email = ?', [userEmailFromToken]);
    if (users.length === 0) {
        console.warn(`[Auth Middleware] Usuario con email ${userEmailFromToken} (del token) no encontrado en la DB.`);
        return res.status(401).json({ message: 'Usuario del token no válido.' });
    }
    req.userId = users[0].id;
    */
    // --- Fin Opcional ---

    // Adjuntar el ID del usuario y el token original a la solicitud
    req.userId = userIdFromToken; // Asignar el ID numérico
    req.token = token; // Mantenemos el token original si lo necesitamos después (ej. para proxy a Aulify)
    
    console.log(`[Auth Middleware] Token verificado. Usuario ID: ${req.userId} adjuntado.`);
    next(); // Continuar al siguiente middleware o ruta

  } catch (error) {
    console.warn("[Auth Middleware] Error al verificar token JWT:", error.name, error.message);
    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Token inválido.', error: error.message });
    } else if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expirado.', error: error.message });
    }
    // Otro tipo de error durante la verificación
    return res.status(500).json({ message: 'Error interno al procesar el token.' });
  }
};

export { verifyTokenPresence }; 