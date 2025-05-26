import express from 'express'
import { getCustomers, getCustomersReports, newCustomer } from '../controllers/customer.controller.js'
const router = express.Router()

router.post('/create/', newCustomer)
router.get('/get/:companyId', getCustomers)
router.get('/get-customers-reports/:companyId/:date', getCustomersReports)

export default router
