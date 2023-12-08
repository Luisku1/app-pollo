import Product from '../models/product.model.js'

export const newProduct = async (req, res, next) => {

	const {productName, company} = req.body

	console.log(productName)

	const newProduct = new Product({ name: productName, company })

	try {

		await newProduct.save()
		res.status(201).json('Product created successfully')

	} catch (error) {

		next(error)
	}
}

export const getProducts = async (req, res, next) => {

	const company = req.params.id

	try {

		const products = await Product.find({company})
		res.status(200).json({products: products})

	} catch (error) {

	}
}