import mongoose, { Schema } from 'mongoose'

const providerPurchaseSchema = mongoose.Schema({

  isReturn: {
    type: Boolean,
    default: false
  },

  branche: {
    type: String, ref: 'Branche',
    required: true
  },

  supervisor: {
    type: String, ref: 'Supervisor',
    required: true
  },

  provider: {
    type: String, ref: 'Provider',
    required: true
  },

  product: {
    type: String, ref: 'Product',
    required: true
  },

  weight: {
    type: Number,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  comment: {
    type: String,
  },

  specialPrice: {
    type: Boolean,
    default: false
  },

}, { timestamps: true })

providerPurchaseSchema.index({ createdAt: -1, provider: 1 }, { unique: true })
providerPurchaseSchema.index({ company: 1, createdAt: -1, provider: 1 }, { unique: true })
const ProviderPurchase = mongoose.model('ProviderPurchase', providerPurchaseSchema)

export default ProviderPurchase