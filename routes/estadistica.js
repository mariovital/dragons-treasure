
import express from 'express'
const router = express.Router()

import { getStat, recordDefeat, recordVictory } from '../controllers/estadistica.controller.js'

// Add a simple test route to verify the router is working
router.get('/test', (req, res) => {
    console.log("Test route hit");
    res.json({ message: "Estadistica router is working" });
});

router.get('/:idUser', getStat)
router.post('/victoria', recordVictory)
router.post('/derrota', recordDefeat)

export { router }
