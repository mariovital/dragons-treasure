
import express from 'express'
const router = express.Router()

import { getUser } from '../controllers/usuario.controller.js'

router.get('/:id', getUser)

export { router }
