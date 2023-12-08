import express from 'express'
import { getPrices, newPrice } from '../controllers/price.controller.js'

const router = express.Router()

router.post('/new-price', newPrice)
router.get('/prices/:branchId', getPrices)

export default router