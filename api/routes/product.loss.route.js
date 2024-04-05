import express from 'express'
import { create, deleteProductLoss, getProductLosses } from '../controllers/product.loss.controller.js'

const router = express.Router()

router.post('/create', create)
router.get('/get/:branchId/:date', getProductLosses)
router.delete('/delete/:productLossId', deleteProductLoss)

export default router