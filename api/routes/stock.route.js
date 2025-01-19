import express from 'express'
import { createStock, deleteStock, getBranchDayStock, getTotalStockByBranch, getTotalStockByProduct } from '../controllers/stock.controller.js'

const router = express.Router()

router.post('/create', createStock)
router.get('/get-branch-stock/:branchId/:date', getBranchDayStock)
router.get('/get-total-stock-by-product/:companyId/:date', getTotalStockByProduct)
router.get('/get-total-stock-by-branch/:companyId/:date', getTotalStockByBranch)
router.delete('/delete/:stockId', deleteStock)

export default router