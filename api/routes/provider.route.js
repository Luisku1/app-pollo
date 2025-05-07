import express from 'express'
import { deleteProvider, newProvider, newMovement, deleteMovement, getMovements, getProviders, getPayments, getProviderAverage, updateProvider, getPurchases, newPayment, deletePayment } from '../controllers/provider.controller.js'
const router = express.Router()

router.post('/create', newProvider)
router.post('/create-providers-movement', newMovement)
router.post('/new-payment-providers', newPayment)
router.put('/update', updateProvider)
router.get('/get-providers/:companyId', getProviders)
router.get('/get-providers-movements/:companyId/:date', getMovements)
router.get('/get-providers-payments/:companyId/:date', getPayments)
router.get('/get-provider-avg/:providerId', getProviderAverage)
router.delete('/delete-provider/:companyId', deleteProvider)
router.delete('/delete-provider-movement/:movementId', deleteMovement)
router.delete('/delete-payment-providers/:paymentId', deletePayment)
export default router