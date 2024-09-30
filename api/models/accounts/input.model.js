import mongoose, { Schema } from 'mongoose'

const inputSchema = mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  comment: {
    type: String,
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

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
  },

  customer: {
    type: Schema.Types.ObjectId, ref: 'Customer'
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const Input = mongoose.model('Input', inputSchema)

export default Input