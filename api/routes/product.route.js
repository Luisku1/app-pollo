import express from 'express'
import { deleteProduct, getProducts, newProduct } from '../controllers/product.controller.js'

const router = express()

router.post('/create', newProduct)
router.get('/get-products/:companyId', getProducts)
router.delete('/delete/:productId', deleteProduct)

export default router