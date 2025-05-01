import { Router } from 'express';
// Ensure all required controllers are imported
import { 
    getUltimasPartidas, 
    getLeaderboard, 
    getTiempoJugado,
    getStat, 
    recordVictory, 
    recordDefeat 
} from '../controllers/estadistica.controller.js';

const router = Router();

// --- Define Specific Routes FIRST ---

// GET leaderboard - Most specific GET route
router.get('/leaderboard', getLeaderboard); 

// GET recent games - Specific path segment before parameter
router.get('/ultimas-partidas/:idUsuario', getUltimasPartidas); 

// GET time played per day for a user (NEW ROUTE)
router.get('/tiempo-jugado/:idUsuario', getTiempoJugado); 

// POST victory/defeat
router.post('/victory', recordVictory);
router.post('/defeat', recordDefeat);

// --- Define Generic Routes LAST ---

// GET ALL STATS for a specific user - Keep this last among GET routes
router.get('/stats/:idUsuario', getStat); 

export { router };
