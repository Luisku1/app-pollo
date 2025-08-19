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

	isInitial: {
		type: Boolean,
		default: false
	},

	midDay: {
		type: Boolean,
		default: false
	},

	associatedStock: {
		type: Schema.Types.ObjectId, ref: 'Stock'
	},

	company: {
		type: Schema.Types.ObjectId, ref: 'Company',
		required: true
	},

	registeredBy: {
		type: Schema.Types.ObjectId, ref: 'Employee',
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

	output: {
		type: Schema.Types.ObjectId, ref: 'Output'
	},

	input: {
		type: Schema.Types.ObjectId, ref: 'Input'
	},

}, { timestamps: true })

stockSchema.index({ associatedStock: 1 })

const Stock = mongoose.model('Stock', stockSchema)

export default Stock