import express from 'express';
// Corregir ruta al controlador para apuntar a Backend/controllers/
import { getCoinsController, getLastStickerController } from '../Backend/controllers/aulify.controller.js';

const router = express.Router();

// Ruta para obtener las monedas del usuario desde Aulify
// GET /aulify/coins
router.get('/coins', getCoinsController);

// Ruta para obtener el último sticker del usuario desde Aulify
// GET /aulify/last-sticker
router.get('/last-sticker', getLastStickerController);

// Exportar usando sintaxis ES Module
export { router }; 