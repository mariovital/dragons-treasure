import jwt from 'jsonwebtoken';
import 'dotenv/config';

const BACKEND_JWT_SECRET = process.env.BACKEND_JWT_SECRET;

export const verifyAdminRole = (req, res, next) => {
    console.log('[Admin Middleware] Verifying admin role for path:', req.path);
    const authHeader = req.headers['authorization'];

    // 1. Verificar presencia del header
    if (!authHeader) {
        console.warn('[Admin Middleware] No Authorization header found.');
        return res.status(401).json({ success: false, message: 'Acceso no autorizado (Falta encabezado)' });
    }

    // 2. Verificar formato 'Bearer token'
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.warn('[Admin Middleware] Authorization header format is invalid.');
        return res.status(401).json({ success: false, message: 'Acceso no autorizado (Formato inválido)' });
    }

    const token = tokenParts[1];
    if (!token) {
        console.warn('[Admin Middleware] Token not found after Bearer.');
        return res.status(401).json({ success: false, message: 'Acceso no autorizado (Token vacío)' });
    }

    // 3. Verificar el token JWT
    if (!BACKEND_JWT_SECRET) {
        console.error('[Admin Middleware] Error: BACKEND_JWT_SECRET no está definida.');
        return res.status(500).json({ success: false, message: 'Error de configuración interna del servidor [Admin Secret]' });
    }

    try {
        console.log('[Admin Middleware] Attempting JWT verification...');
        const payload = jwt.verify(token, BACKEND_JWT_SECRET);
        console.log('[Admin Middleware] Token verification successful. Payload:', payload);

        // 4. Verificar Rol de Administrador
        if (payload && payload.role === 'admin') {
            req.userId = payload.userId;
            console.log(`[Admin Middleware] Role check PASSED. Granting access for userId: ${req.userId}`);
            next(); 
        } else {
            console.warn(`[Admin Middleware] Role check FAILED. Denying access for userId: ${payload?.userId}. Role: ${payload?.role}`);
            return res.status(403).json({ success: false, message: 'Acceso denegado: Permisos insuficientes.' });
        }

    } catch (error) {
        console.warn('[Admin Middleware] JWT verification FAILED:', error.name, error.message);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: 'Acceso no autorizado (Token expirado)' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: 'Acceso no autorizado (Token inválido)' });
        } else {
            return res.status(500).json({ success: false, message: 'Error interno al verificar la autenticación.' });
        }
    }
}; 