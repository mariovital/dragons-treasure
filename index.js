
import express from 'express'
import cors from 'cors'
import multer from 'multer'


import { router as usuario } from './routes/usuario.js'
import { router as estadistica } from './routes/estadistica.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(multer().array())
app.use(cors())

// Rutas
app.use('/usuario', usuario)
app.use('/estadistica', estadistica)

// Ruta Prueba
app.get('/', (req, res) => {
    res.send(`API Dragon's Treasure`)
})

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Error interno del servidor.'})
})

// Iniciar Servidor.
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`)
})