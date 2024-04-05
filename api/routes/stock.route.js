import express from 'express'
import { createStock, deleteStock, getBranchDayStock, getInitialStock } from '../controllers/stock.controller.js'

const router = express.Router()

router.post('/create', createStock)
router.get('/get-branch-stock/:branchId/:date', getBranchDayStock)
router.delete('/delete/:stockId', deleteStock)
router.get('/initial-stock/:branchId/:date', getInitialStock)

export default router