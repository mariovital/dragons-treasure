
import express from 'express'
import cors from 'cors'
import multer from 'multer'

import { authRouter } from './routes/auth.js'; // <-- Add this line
import { router as usuario } from './routes/usuario.js'
import { router as estadistica } from './routes/estadistica.js'

const app = express()
const PORT = process.env.PORT || 3000

// Add more detailed request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') {
        console.log('Body:', req.body);
    }
    next();
});

// Configure middleware - order matters
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Add a test route to verify the server is working
app.get('/test', (req, res) => {
    console.log("Server test route hit");
    res.json({ message: "Server is working" });
});

// Direct test endpoint for victory
app.post('/test-victory', (req, res) => {
    console.log("Test victory endpoint hit");
    console.log("Request body:", req.body);
    
    // Check if we're receiving the gamertag
    if (req.body && req.body.gamertag) {
        console.log("Gamertag received:", req.body.gamertag);
        return res.json({
            code: 1,
            message: "Test victory recorded",
            name: "Test Player",
            totalVictories: 1
        });
    } else {
        console.log("No gamertag in request body");
        return res.status(400).json({
            code: 0,
            message: "No gamertag provided"
        });
    }
});

// Rutas
app.use('/aulifyLogin', authRouter);
app.use('/estadistica', /* jwtMiddleware, */ estadistica); // Temporarily commented out jwtMiddleware if not defined yet
app.use('/usuario', usuario);


// Ruta Prueba
app.get('/', (req, res) => {
    res.send(`API Dragon's Treasure`)
})

// Manejo de errores (debe ir al final)
app.use((err, req, res, next) => { // Ensure 'next' is present
    console.error('--- Error caught by main error handler: ---');
    console.error(err); // Log the full error
    // Check if headers were already sent (e.g., by the controller)
    if (!res.headersSent) {
       // Use error status if available, otherwise default to 500
       res.status(err.status || 500).json({
           error: err.message || 'Internal Server Error'
       });
    }
    // If headers were sent, we can't send another response,
    // but the error is logged.
});

// Iniciar Servidor.
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`)
})