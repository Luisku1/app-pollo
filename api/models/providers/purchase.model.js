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

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  supervisor: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const ProviderPurchase = mongoose.model('ProviderPurchase', providerPurchaseSchema)

export default ProviderPurchase