import mongoose, { Schema } from 'mongoose'

const providerPaymentSchema = mongoose.Schema({

  amount: {
    type: Decimal128,
    required: true
  },

  provider: {
    type: Schema.Types.ObjectId, ref: 'Provider',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const ProviderPayment = mongoose.model('ProviderPayment', providerPaymentSchema)

export default ProviderPayment