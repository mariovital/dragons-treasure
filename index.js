import 'dotenv/config'; // Load .env variables
import express from 'express'
import cors from 'cors'
import multer from 'multer'

import { authRouter } from './routes/auth.js'; // <-- Add this line
import { router as usuario } from './routes/usuario.js'
import { router as estadistica } from './routes/estadistica.js'
import { router as aulifyRoutes } from './Backend/routes/aulify.js'; // Corregido: Añadir Backend/
import { verifyTokenPresence } from './middleware/verifyTokenPresence.js'; // Import the new middleware

const app = express()
const PORT = process.env.PORT || 3000

// --- CORS Configuration ---
// Define allowed origins
const allowedOrigins = ['http://localhost:5173']; // Add your frontend's origin

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // If you need to handle cookies or authorization headers
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use configured CORS middleware *before* your routes
app.use(cors(corsOptions));

// Add more detailed request logging (optional, but helpful for debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    // Log body ONLY if content-type is JSON to avoid issues with other types
    if (req.headers['content-type'] === 'application/json') {
        console.log('Body:', req.body); // Log body *after* express.json potentially runs
    }
    next();
});

// Configure middleware - order matters
// Ensure JSON parser runs early, BEFORE routes that need req.body
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
// REMOVE global multer - Apply it only to specific routes needing multipart/form-data
// app.use(multer().array()) 

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
app.use('/estadistica', verifyTokenPresence, estadistica);
app.use('/aulify', verifyTokenPresence, aulifyRoutes); // Registrar rutas de Aulify
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