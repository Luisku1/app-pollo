import mongoose, { Schema } from 'mongoose'

const providerPaymentSchema = mongoose.Schema( {

    amount: {
        type: Decimal128,
        required: true
    },

    provider: {
        type: Schema.Types.ObjectId, ref: 'Provider',
        required: true
    }
}, { timestamps: true } )

const ProviderPayment = mongoose.model('ProviderPayment', providerPaymentSchema)

export default ProviderPayment