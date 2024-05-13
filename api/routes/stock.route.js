import express from 'express'
import { createStock, deleteStock, getBranchDayStock, getInitialStock, getTotalStock } from '../controllers/stock.controller.js'

const router = express.Router()

router.post('/create', createStock)
router.get('/get-branch-stock/:branchId/:date', getBranchDayStock)
router.get('/get-total-stock/:companyId/:date', getTotalStock)
router.delete('/delete/:stockId', deleteStock)
router.get('/initial-stock/:branchId/:date/:reportExists', getInitialStock)

export default router