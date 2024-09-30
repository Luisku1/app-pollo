import express from 'express'
import { getCustomers, newCustomer } from '../controllers/customer.controller.js'
const router = express.Router()

router.post('/create/', newCustomer)
router.get('/get/:companyId', getCustomers)

export default router
