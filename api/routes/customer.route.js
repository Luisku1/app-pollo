import express from 'express'
import { newCustomer } from '../controllers/customer.controller.js'
const router = express.Router()

router.post('/create/', newCustomer)

export default router
