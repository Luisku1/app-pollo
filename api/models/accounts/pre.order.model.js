import mongoose, { Schema } from 'mongoose'

const preOrderSchema = mongoose.Schema({

  deliverDate: {
    type: Date,
    required: true
  },

  delivered: {
    type: Boolean,
    default: false
  },

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

  advancedMoney: {
    type: Number,
    default: 0
  },

  pendingAmount: {
    type: Number,
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
  },

  supervisor: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  seller: {
    type: Schema.Types.ObjectId, ref: 'Employee',
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }
}, { timestamps: true })

preOrderSchema.index({ deliverDate: -1, branch: 1 })

const PreOrder = mongoose.model('PreOrder', preOrderSchema)

export default PreOrder