import express from 'express'
import { deletePurchase, deleteProvider, newProvider, newMovement, getMovements, getProviders, getProviderAverage, updateProvider, getPurchases } from '../controllers/provider.controller.js'
const router = express.Router()

router.post('/create', newProvider)
router.put('/update', updateProvider)
router.get('/get-providers/:companyId', getProviders)
router.get('/get-provider-avg/:providerId', getProviderAverage)
router.post('/create-movement', newMovement)
router.get('/get-providers-movements/:companyId', getMovements)
router.get('/get-providers-purchase/:companyId', getPurchases)
router.delete('/:purchaseId/delete', deletePurchase)
router.delete('/delete-provider/:companyId', deleteProvider)
export default router

