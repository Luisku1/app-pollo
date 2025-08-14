import express from 'express'
import { deleteProduct, getProducts, newProduct, newProductFormula, updateProduct, updateProductFormula } from '../controllers/product.controller.js'

const router = express()

router.post('/create', newProduct)
router.post('/create-formula', newProductFormula)
router.put('/update-formula/:formulaId', updateProductFormula)
router.put('/update/:productId', updateProduct)
router.get('/get-products/:companyId', getProducts)
router.delete('/delete/:productId', deleteProduct)

export default router