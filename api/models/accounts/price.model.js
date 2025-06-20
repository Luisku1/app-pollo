import mongoose, { Schema } from 'mongoose'

const priceSchema = mongoose.Schema({

  price: {
    type: Number,
    required: true
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
  },

  residual: {
    type: Boolean,
    default: false
  },

  company: {

    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

priceSchema.index({ product: 1, branch: 1, residual: 1, createdAt: -1 }, { unique: true })

const Price = mongoose.model('Price', priceSchema)

export default Price