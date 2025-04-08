
import express from 'express'
const router = express.Router()

import { doLogin} from '../controllers/login.controller.js'

router.post('/login',doLogin)

export { router } 

