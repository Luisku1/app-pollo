import express from 'express'
import { getProducts, newProduct } from '../controllers/product.controller.js'

const router = express()

router.post('/new-product', newProduct)
router.get('/products/:id', getProducts)

export default router