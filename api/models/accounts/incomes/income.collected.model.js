import mongoose from 'mongoose'
const { Schema } = mongoose

const incomeCollectedSchema = mongoose.Schema({

  amount: {
    type: Number,
    min: [0, "El monto debe ser superior a $0.00"],
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch'
  },

  customer: {
    type: Schema.Types.ObjectId, ref: 'Customer'
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

}, {timestamps: true})

incomeCollectedSchema.index({company: 1, createdAt: -1, customer: 1})
incomeCollectedSchema.index({company: 1, createdAt: -1, branch: 1})

const IncomeCollected = mongoose.model('IncomeCollected', incomeCollectedSchema)

export default IncomeCollected