
import express from 'express'
const router = express.Router()

import { getStat} from '../controllers/estadistica.controller.js'


router.get('/:id', getStat)

export { router } 
