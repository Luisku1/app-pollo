import express from 'express'
import { createStock, deleteStock, getDailyStock } from '../controllers/stock.controller.js'

const router = express.Router()

router.post('/create', createStock)
router.get('/daily-stock/:branchId/:date', getDailyStock)
router.delete('/delete/:stockId', deleteStock)

export default router