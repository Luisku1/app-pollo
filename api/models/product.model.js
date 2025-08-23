import mongoose, { Schema } from 'mongoose'

const productSchema = mongoose.Schema({

	name: {
		type: String,
		required: true
	},

	company: {
		type: Schema.Types.ObjectId, ref: 'Company',
		required: true,
	},

	byPieces: {
		type: Boolean,
		default: false
	},

	isSupply: {
		type: Boolean,
		default: false
	},

	priceFormula: {
		type: String,
		default: ''
	},

	createdAt: {
		type: Date,
		required: true
	}
})

productSchema.index({ name: 1, company: 1 }, { unique: true })

const Product = mongoose.model('Product', productSchema)

export default Product