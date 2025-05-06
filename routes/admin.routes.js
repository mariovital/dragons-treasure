import { Router } from 'express';
import { getPlatformSummary, getAllUsers } from '../controllers/admin.controller.js';

// Nota: El middleware verifyAdminRole se aplicará en index.js antes de montar este router

const router = Router();

// Ruta para obtener el resumen general de la plataforma
// GET /admin/stats/summary
router.get('/stats/summary', getPlatformSummary);

// Ruta para obtener la lista paginada de usuarios
// GET /admin/users?page=1&limit=10
router.get('/users', getAllUsers);

// Aquí se podrían añadir más rutas de admin en el futuro
// (ej. para modificar un usuario, ver detalles de un usuario, etc.)

export default router; 