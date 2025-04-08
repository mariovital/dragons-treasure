
import express from 'express'
const router = express.Router()

import { getUser} from '../controllers/usuario.controller.js'
import { middleware } from '../middleware/jwt.middleware.js'

router.post('/usuario', middleware ,getUser)

export { router } 
