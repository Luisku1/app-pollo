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
    required: true
  },

  type: {
    type: Schema.Types.ObjectId, ref: 'IncomeType',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const IncomeCollected = mongoose.model('IncomeCollected', incomeCollectedSchema)

export default IncomeCollected