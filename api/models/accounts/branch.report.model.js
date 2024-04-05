import mongoose, { Schema } from 'mongoose'

const branchReportSchema = mongoose.Schema({

  initialStock: {
    type: Number,
    required: true
  },

  finalStock: {
    type: Number,
    required: true
  },

  inputs: {
    type: Number,
    required: true
  },

  outputs: {
    type: Number,
    required: true
  },

  outgoings: {
    type: Number,
    required: true
  },

  incomes: {
    type: Number,
    required: true
  },

  balance: {
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

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  assistant: {
    type: Schema.Types.ObjectId, ref: 'Employee'
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const BranchReport = mongoose.model('BranchReport', branchReportSchema)

export default BranchReport