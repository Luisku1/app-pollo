import mongoose, { Schema } from 'mongoose'

const providerReturnsSchema = mongoose.Schema({

  amount: {
    type: Number,
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

  comment: {
    type: String,
  },

  specialPrice: {
    type: Boolean,
    default: false
  },

  branche: {
    type: String, ref: 'Branche',
    required: true
  },

  product: {
    type: String, ref: 'Product',
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

  isReturn: {
    type: Boolean,
    default: false
  }

}, { timestamps: true })

providerReturnsSchema.index({ createdAt: -1, provider: 1 }, { unique: true })
providerReturnsSchema.index({ company: 1, createdAt: -1, provider: 1 }, { unique: true })
const ProviderReturns = mongoose.model('ProviderReturns', providerReturnsSchema)

export default ProviderReturns