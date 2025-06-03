import Price from '../models/accounts/price.model.js'
import Branch from '../models/branch.model.js'
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