import mongoose, { Schema } from 'mongoose'

const outputSchema = mongoose.Schema({

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
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product'
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

const Output = mongoose.model('Output', outputSchema)

export default Output