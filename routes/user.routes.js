import { Router } from 'express';
import { syncCoinsController } from '../controllers/usuario.controller.js';
// Ruta corregida relativa a la carpeta routes/ principal
import { verifyTokenPresence } from '../middleware/verifyTokenPresence.js';

const router = Router();

// Ruta para sincronizar monedas (actualizar la DB local con el valor de Aulify)
// Requiere nuestro JWT para identificar al usuario (req.userId)
// y el token de Aulify en el header X-Aulify-Token para llamar a Aulify
router.put('/usuario/sync-coins', verifyTokenPresence, syncCoinsController);

export default router; 