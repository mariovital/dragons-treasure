
import express from 'express'
const router = express.Router()

import { getUser} from '../controllers/usuario.controller.js'


router.get('/:id', getUser)

// Add this to routes/usuario.js
router.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
  });

export { router } 
