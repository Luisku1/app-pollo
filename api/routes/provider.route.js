import express from 'express'
import { deleteProvider, newProvider, newMovement, deleteMovement, getMovements, getProviders, getProviderAverage, updateProvider, getPurchases, newPayment, deletePayment } from '../controllers/provider.controller.js'
const router = express.Router()

router.post('/create', newProvider)
router.put('/update', updateProvider)
router.delete('/delete-provider/:companyId', deleteProvider)
router.get('/get-providers/:companyId', getProviders)
router.post('/create-providers-movement', newMovement)
router.delete('/delete-provider-movement/:movementId', deleteMovement)
router.get('/get-providers-movements/:companyId', getMovements)
router.post('/new-payment', newPayment)
//router.get('/get-payments/:companyId', getPayments)
router.delete('/delete-payment/:companyId', deletePayment)
//router.get('/get-provider-payments/:providerId', getProviderPayments)
router.get('/get-providers-purchase/:companyId', getPurchases)
router.get('/get-provider-avg/:providerId', getProviderAverage)
export default router

