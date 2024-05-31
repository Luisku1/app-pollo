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

  pieces: {
    type: Number,
    required: true
  },

  comment: {
    type: String,
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
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

}, {timestamps: true})

const ProviderInput = mongoose.model('ProviderInput', providerInputSchema)

export default ProviderInput