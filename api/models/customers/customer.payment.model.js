import mongoose, { Schema } from 'mongoose'

const customerPaymentSchema = mongoose.Schema({

	amount: {
		type: Number,
		required: true
	},

	company: {
		type: Schema.Types.ObjectId, ref: 'Company',
		required: true
	},

	customer: {
		type: Schema.Types.ObjectId, ref: 'Customer',
		required: true
	},

	createdAt: {
		type: Date,
		required: true
	}
})

const CustomerPayment = mongoose.model('ProviderPayment', customerPaymentSchema)

export default CustomerPayment