const verifyTokenPresence = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("[Auth Middleware] Token missing or invalid format.");
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado o inválido.' });
  }

  // Extraer el token
  const token = authHeader.split(' ')[1];

  if (!token) {
      console.warn("[Auth Middleware] Token extracted is empty.");
      return res.status(401).json({ message: 'Acceso denegado. Token vacío.' });
  }

  // Adjuntar token a la solicitud para uso posterior
  req.token = token; 
  
  console.log("[Auth Middleware] Token found and attached to req.token.");
  console.log("[Auth Middleware] Value being attached:", req.token);
  next(); // Continuar al siguiente middleware o ruta
};

export { verifyTokenPresence }; 