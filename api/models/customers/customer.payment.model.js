import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const customerPaymentSchema = mongoose.Schema( {

    amount: {
        type: Decimal128,
        required: true
    },

    customer: {
        type: Schema.Types.ObjectId, ref: 'Customer',
        required: true
    }

}, { timestamps: true } )

const CustomerPayment = mongoose.model('ProviderPayment', customerPaymentSchema)

export default CustomerPayment