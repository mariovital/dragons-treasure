import jwt from 'jsonwebtoken';
import 'dotenv/config'; // Asegúrate de cargar las variables de entorno

const BACKEND_JWT_SECRET = process.env.BACKEND_JWT_SECRET;

export const verifyTokenPresence = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.warn('Auth Middleware: No Authorization header found.');
        return res.status(401).json({ success: false, message: 'Acceso no autorizado (Falta encabezado)' });
    }

    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.warn('Auth Middleware: Authorization header format is invalid (Expected \'Bearer token\').');
        return res.status(401).json({ success: false, message: 'Acceso no autorizado (Formato inválido)' });
    }

    const token = tokenParts[1];

    if (!token) {
        console.warn('Auth Middleware: Token is missing after \'Bearer \'.');
        return res.status(401).json({ success: false, message: 'Acceso no autorizado (Falta token)' });
    }

    if (!BACKEND_JWT_SECRET) {
        console.error("Auth Middleware: Error crítico - BACKEND_JWT_SECRET no está definida en .env");
        return res.status(500).json({ success: false, message: "Error interno del servidor [JWT Config]" });
    }

    try {
        // Verificar el token usando nuestro secret
        const decoded = jwt.verify(token, BACKEND_JWT_SECRET);

        // Verificar que el payload tenga nuestro userId
        if (!decoded || typeof decoded.userId === 'undefined') {
            console.warn('Auth Middleware: Token decodificado inválido o falta userId.', decoded);
            return res.status(401).json({ success: false, message: 'Token inválido (Payload incorrecto)' });
        }

        // Añadir el userId decodificado al objeto request para uso posterior
        req.userId = decoded.userId;
        console.log(`Auth Middleware: Token válido para userId: ${req.userId}`);
        next(); // Token válido, continuar

    } catch (error) {
        console.warn('Auth Middleware: Error al verificar el token:', error.name, error.message);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: 'Token expirado' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        } else {
            return res.status(500).json({ success: false, message: 'Error al procesar el token' });
        }
    }
}; 