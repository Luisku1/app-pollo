import mongoose, { Schema } from 'mongoose'

const providerPaymentSchema = mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  provider: {
    type: Schema.Types.ObjectId, ref: 'Provider',
    required: true
  },

  comment: {
    type: String,
    default: ''
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

}, { timestamps: true })

const ProviderPayment = mongoose.model('ProviderPayment', providerPaymentSchema)

export default ProviderPayment