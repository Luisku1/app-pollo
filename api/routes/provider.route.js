import express from 'express'
import { deletePurchase, deleteProvider, newProvider, newPurchase, getProviders, getProviderAverage } from '../controllers/provider.controller.js'
const router = express.Router()

router.post('/create', newProvider)
router.get('/get-providers/:companyId', getProviders)
router.get('/get-provider-avg/:providerId', getProviderAverage)
router.post('/purchase', newPurchase)
router.delete('/:purchaseId/delete', deletePurchase)
router.delete('/delete-provider/:companyId', deleteProvider)
export default router