import { Router } from 'express';
import { establishSessionController } from '../controllers/auth.controller.js';
// Importa otros controladores de autenticación si los tienes (ej. login normal, register)

const router = Router();

// Ruta para que Unity establezca sesión después del login de Aulify
router.post('/establish-session', establishSessionController);

// Aquí podrías tener otras rutas de autenticación como:
// router.post('/login', loginController); 
// router.post('/register', registerController);

export default router; 