import mongoose, { Schema } from 'mongoose'

const inputSchema = mongoose.Schema(
  {
    price: {
      type: Number,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    weight: {
      type: Number,
      required: true
    },

    comment: {
      type: String,
    },

    pieces: {
      type: Number,
      required: true
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
      required: true
    },

    createdAt: {
      type: Date,
      required: true
    }
})

const Input = mongoose.model('Input', inputSchema)

export default Input