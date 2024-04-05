import Price from '../models/accounts/price.model.js'
import Branch from '../models/branch.model.js'
import Product from '../models/product.model.js'
import { errorHandler } from '../utils/error.js'

export const newProduct = async (req, res, next) => {

	const {name, company} = req.body
	const createdAt = new Date().toISOString()
	let bulkOps = []

	const newProduct = new Product({ name, company, createdAt })

	try {

		await newProduct.save()

		const branches = await Branch.find({company}, ['_id'])

		branches.forEach(branch => {


			let document = {
				price: 0,
				product: newProduct._id,
				branch: branch._id,
				createdAt: functionalDate
			}

			bulkOps.push({ "insertOne": {"document": document}})
		});

		Price.bulkWrite(bulkOps)

		res.status(201).json({product: newProduct})

	} catch (error) {

		next(error)
	}
}

export const deleteProduct = async (req, res, next) => {

	const productId = req.params.productId

	try {

		const deleted = await Product.deleteOne({_id: productId})

		if(!deleted.deletedCount == 0) {

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

		const products = await Product.find({company: companyId})
		res.status(200).json({products: products})

	} catch (error) {

	}
}