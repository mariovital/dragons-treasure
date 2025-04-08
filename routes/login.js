
import express from 'express'
const router = express.Router()

import { doLogin} from '../controllers/users.controller.js'

router.post('/usuario',doLogin)

export { router } 

