import express from 'express'
import { getAllBranchPrices, getBranchCurrentPrices, initializeBranchPrices, newPrice, newPrices } from '../controllers/price.controller.js'

const router = express.Router()

router.post('/new-price', newPrice)
router.post('/new-prices/:companyId', newPrices)
router.post('/initialize-prices/:companyId/:branchId', initializeBranchPrices)
router.get('/get-branch-prices/:branchId/:date/:reportExists', getBranchCurrentPrices)
router.get('/get-products-price/:companyId', getAllBranchPrices)

export default router