import mongoose, { Schema } from 'mongoose'

const providerPurchaseSchema = mongoose.Schema({

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

  pieces: {
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

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  supervisor: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  provider: {
    type: Schema.Types.ObjectId, ref: 'Provider',
    required: true
  }

}, { timestamps: true })

const ProviderPurchase = mongoose.model('ProviderPurchase', providerPurchaseSchema)

export default ProviderPurchase