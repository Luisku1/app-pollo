import mongoose from 'mongoose'
const { Schema } = mongoose

const incomeCollectedSchema = mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    default: null
  },

  customer: {
    type: Schema.Types.ObjectId, ref: 'Customer',
    default: null
  },

  owner: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    default: null
  },

  prevOwner: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    default: null
  },

  prevOwnerIncome: {
    type: Schema.Types.ObjectId, ref: 'IncomeCollected',
    default: null
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  partOfAPayment: {
    type: Boolean,
    required: true,
    default: false
  },

  type: {
    type: Schema.Types.ObjectId, ref: 'IncomeType',
    required: true
  }

}, { timestamps: true })

incomeCollectedSchema.index({ company: 1, createdAt: -1, customer: 1 })
incomeCollectedSchema.index({ company: 1, createdAt: -1, branch: 1 })

const IncomeCollected = mongoose.model('IncomeCollected', incomeCollectedSchema)

export default IncomeCollected