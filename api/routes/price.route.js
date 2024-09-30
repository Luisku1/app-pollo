import express from 'express'
import { getAllBranchPrices, getBranchCurrentPrices, getBranchProductPrice, getCustomerProductPrice, initializeBranchPrices, newPrice, newPrices } from '../controllers/price.controller.js'

const router = express.Router()

router.post('/new-price', newPrice)
router.post('/new-prices/:companyId', newPrices)
router.post('/initialize-prices/:companyId/:branchId', initializeBranchPrices)
router.get('/get-branch-prices/:branchId/:date', getBranchCurrentPrices)
router.get('/get-products-price/:companyId', getAllBranchPrices)
router.get('/get-branch-product-price/:branchId/:productId/:date', getBranchProductPrice)
router.get('/get-customer-product-price/:customerId/:productId/:date', getCustomerProductPrice)

export default router