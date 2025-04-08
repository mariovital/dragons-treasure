
import express from 'express'
const router = express.Router()

import { getUser} from '../controllers/users.controller.js'

router.post('/usuario',getUser)

export { router } 
