import { Router } from 'express';
// Ensure all required controllers are imported
import { 
    getUltimasPartidas, 
    getLeaderboard, 
    getTiempoJugado,
    recordGameController,
    getUserSummary
} from '../controllers/estadistica.controller.js';
import { verifyTokenPresence } from '../middleware/verifyTokenPresence.js'; // Middleware needed for protected routes

const router = Router();

// --- Define Specific Routes FIRST ---

// GET leaderboard - Now requires authentication 
// (assuming only logged-in users can see it)
router.get('/leaderboard', verifyTokenPresence, getLeaderboard); 

// GET recent games - Uses token, remove param
router.get('/ultimas-partidas', verifyTokenPresence, getUltimasPartidas); 

// GET time played per day - Uses token, remove param
router.get('/tiempo-jugado', verifyTokenPresence, getTiempoJugado); 

// POST game result - NEW consolidated route
router.post('/record-game', verifyTokenPresence, recordGameController);

// --- NEW: Endpoint for User Statistics Summary ---
router.get('/user-summary', verifyTokenPresence, getUserSummary);

// --- Define Generic Routes LAST ---

// GET ALL STATS for a specific user - Route REMOVED, merged into /user-summary
// router.get('/stats', verifyTokenPresence, getStat); 

export { router };
