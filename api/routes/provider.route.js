import express from 'express'
import { deletePurchase, newProvider, newPurchase } from '../controllers/providers/provider.controller.js'
const router = express.Router()

router.post('/create', newProvider)
router.post('/purchase', newPurchase)
router.delete('/:purchaseId/delete', deletePurchase)

export default router