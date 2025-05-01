export const verifyTokenPresence = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.warn('Auth Middleware: No Authorization header found.');
        return res.status(401).json({ success: false, message: 'Authorization header is missing' });
    }

    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.warn('Auth Middleware: Authorization header format is invalid (Expected \'Bearer token\').');
        return res.status(401).json({ success: false, message: 'Invalid Authorization header format' });
    }

    const token = tokenParts[1];

    if (!token) {
        console.warn('Auth Middleware: Token is missing after \'Bearer \'.');
        return res.status(401).json({ success: false, message: 'Token is missing' });
    }

    // Basic check passed, token is present and format seems okay.
    // We are NOT validating the token against Aulify here.
    console.log('Auth Middleware: Bearer token present.'); 
    next(); // Proceed to the next middleware or route handler
}; 