
import express from 'express'
const router = express.Router()

import { getUser, createOrGetUser } from '../controllers/usuario.controller.js'

router.get('/:id', getUser)

// Add POST route to create or get user by email
router.post('/', createOrGetUser); // Assuming you want the route to be POST /usuario

export { router }
