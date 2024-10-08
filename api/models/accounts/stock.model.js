import mongoose, { Schema } from 'mongoose'

const stockSchema = mongoose.Schema({

	pieces: {
		type: Number,
		required: true
	},

	weight: {
		type: Number,
		required: true
	},

	amount: {
		type: Number,
		required: true
	},

	price: {
		type: Number,
		required: true
	},

	company: {
		type: Schema.Types.ObjectId, ref: 'Company',
		required: true
	},

	branch: {
		type: Schema.Types.ObjectId, ref: 'Branch',
		required: true
	},

	product: {
		type: Schema.Types.ObjectId, ref: 'Product',
		required: true
	},

	employee: {
		type: Schema.Types.ObjectId, ref: 'Employee',
		required: true
	},

	createdAt: {
		type: Date,
		required: true
	}
})

const Stock = mongoose.model('Stock', stockSchema)

export default Stock