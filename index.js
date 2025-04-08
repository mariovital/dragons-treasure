
import express from 'express'
import cors from 'cors'
import multer from 'multer'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(multer().array())
app.use(cors())


app.get('/', (req,res) => {
    res.send('Hola desde Dragon Treasure')
})

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`)
})
