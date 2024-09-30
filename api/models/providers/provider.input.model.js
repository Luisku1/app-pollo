import mongoose, { Schema } from 'mongoose'

const providerInputSchema = mongoose.Schema({

  weight: {
    type: Number,
    default: 0.0
  },

  amount: {
    type: Number,
    default: 0.0
  },

  price: {
    type: Number,
    required: true
  },

  pieces: {
    type: Number,
    required: true
  },

  comment: {
    type: String,
    required: true
  },

  specialPrice: {
    type: Boolean,
    default: false
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
  },

  customer: {
    type: Schema.Types.ObjectId, ref: 'Customer'
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    default: null
  },

}, { timestamps: true })

const ProviderInput = mongoose.model('ProviderInput', providerInputSchema)

export default ProviderInput