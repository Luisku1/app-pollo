import mongoose, { Schema } from 'mongoose'

const preOrderSchema = mongoose.Schema({

  orderDate: {
    type: Date,
    required: true
  },

  advancedMoney: {
    type: Number
  },

  amount: {
    type: Number,
    required: true
  },

  pendingAmount: {
    type: Number,
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
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

const PreOrder = mongoose.model('PreOrder', preOrderSchema)

export default PreOrder