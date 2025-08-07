import express from 'express'

import { deleteProvider, newProvider, newMovement, deleteMovement, getMovements, getProviders, getProviderAverage, updateProvider, newPayment, deletePayment } from '../controllers/providers/provider.controller.js'
import { getPayments, getProviderPayments, getProviderProductLastPrice } from '../controllers/providers/payment.controller.js'
const router = express.Router()

router.post('/create', newProvider)
router.post('/create-provider-movement', newMovement)
router.post('/new-payment', newPayment)
router.put('/update', updateProvider)
router.get('/get-providers/:companyId', getProviders)
router.get('/providers-movements/:companyId/:date', getMovements)
router.get('/get-payments/:companyId', getPayments)
router.get('/get-provider-payments/:providerId', getProviderPayments)
router.get('/get-provider-last-price/:providerId/:productId', getProviderProductLastPrice)
router.get('/get-provider-avg/:providerId', getProviderAverage)
router.delete('/delete-provider/:companyId', deleteProvider)
router.delete('/delete-payment/:companyId', deletePayment)
router.delete('/delete-provider-movement/:movementId', deleteMovement)
export default router

