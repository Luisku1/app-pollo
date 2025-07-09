import express from 'express'
import { deleteProduct, getProducts, newProduct, newProductFormula } from '../controllers/product.controller.js'

const router = express()

router.post('/create', newProduct)
router.post('/create-formula', newProductFormula)
router.put('/update-formula/:formulaId', newProductFormula) // Assuming this is for updating the formula
router.get('/get-products/:companyId', getProducts)
router.delete('/delete/:productId', deleteProduct)

export default router