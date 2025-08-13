import Price from '../models/accounts/price.model.js'
import Branch from '../models/branch.model.js'
import BranchProductFormula from '../models/branch.product.formula.model.js'
import Product from '../models/product.model.js'
import { errorHandler } from '../utils/error.js'
import { getDayRange } from '../utils/formatDate.js'

export const productAggregate = (localField, as = null) => {
	return [
		{
			$lookup: {
				from: 'products',
				localField: localField,
				foreignField: '_id',
				as: as || localField
			}
		},
		{
			$unwind: { path: `$${as || localField}`, preserveNullAndEmptyArrays: true }
		}
	]
}

export const newProduct = async (req, res, next) => {

	const { name, company, price } = req.body
	const createdAt = new Date().toISOString()
	let bulkOps = []

	const newProduct = new Product({ name, company, createdAt })

	try {

		await newProduct.save()

		const branches = await Branch.find({ company }, ['_id'])

		const { bottomDate } = getDayRange(new Date())

		branches.forEach(branch => {

			let document = {
				price: price || 0,
				product: newProduct._id,
				branch: branch._id,
				company: company,
				createdAt: bottomDate
			}
			bulkOps.push({ "insertOne": { "document": document } })
		});

		Price.bulkWrite(bulkOps)

		res.status(201).json({ product: newProduct })

	} catch (error) {

		next(error)
	}
}

export const updateProduct = async (req, res, next) => {
	const productId = req.params.productId
	const { name, byPieces } = req.body

	try {

		const updatedProduct = await Product.findByIdAndUpdate(productId, {
			name,
			byPieces
		}, { new: true })

		if (updatedProduct) {
			res.status(200).json({ product: updatedProduct })
		} else {
			next(errorHandler(404, 'Product not found'))
		}

	} catch (error) {
		next(error)
	}
}

export const deleteProduct = async (req, res, next) => {

	const productId = req.params.productId

	try {

		const deleted = await Product.deleteOne({ _id: productId })

		if (!deleted.deletedCount == 0) {

			res.status(200).json('Product deleted successfully')

		} else {

			next(errorHandler(404, 'Product not found'))
		}

	} catch (error) {

		next(error)
	}
}

export const getProducts = async (req, res, next) => {

	const companyId = req.params.companyId

	try {

		const products = await Product.find({ company: companyId })

		if (products.length > 0) {

			res.status(200).json({ products: products })

		} else {

			next(errorHandler(404, 'No products found'))
		}

	} catch (error) {

		next(error)
	}
}


export const newProductFormula = async (req, res, next) => {

	const { branchId, productId, formula } = req.body

	try {

		const newFormula = await BranchProductFormula.create({
			branchId,
			productId,
			formula
		})

		res.status(201).json({ formula: newFormula })

	} catch (error) {

		if (error.code === 11000) {
			return next(errorHandler(400, 'Formula already exists for this product in this branch'))
		}

		next(error)
	}
}

export const updateProductFormula = async (req, res, next) => {

	const { formulaId } = req.params
	const { formula } = req.body

	try {

		const updatedFormula = await BranchProductFormula.findByIdAndUpdate(formulaId,
			{ formula },
			{ new: true }
		)

		if (updatedFormula) {
			res.status(200).json({ formula: updatedFormula })
		} else {
			next(errorHandler(404, 'Formula not found'))
		}

	} catch (error) {
		next(error)
	}
}