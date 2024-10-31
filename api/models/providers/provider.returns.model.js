import mongoose, { Schema } from 'mongoose'

const providerReturnsSchema = mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  weight: {
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

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  supervisor: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  provider: {
    type: Schema.Types.ObjectId, ref: 'Provider',
    required: true
  },

}, { timestamps: true })

const ProviderReturns = mongoose.model('ProviderReturns', providerReturnsSchema)

export default ProviderReturns