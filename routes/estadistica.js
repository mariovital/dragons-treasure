
import express from 'express'
const router = express.Router()

import { getStat} from '../controllers/estadistica.controller.js'


router.get('/:idUser', getStat)

export { router } 
