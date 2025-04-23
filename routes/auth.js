import express from 'express';
const router = express.Router();
import { login } from '../controllers/auth.controller.js';

// Ruta para el login POST /
router.post('/', (req, res, next) => { // Add next parameter
    console.log(`--- ${new Date().toISOString()} - POST /aulifyLogin route hit ---`); // Log route hit
    console.log('Request body in route:', req.body); // Log the body as seen by the route
    // Call the controller and catch potential promise rejections
    login(req, res).catch(next);
});

export { router as authRouter };