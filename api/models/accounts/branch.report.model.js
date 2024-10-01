import mongoose, { Schema } from 'mongoose'

const branchReportSchema = mongoose.Schema({

  initialStock: {
    type: Number,
    required: true
  },

  finalStock: {
    type: Number,
    default: 0
  },

  finalStockArray: [{
    type: Schema.Types.ObjectId, ref: 'Stock',
    required: true
  }],

  inputs: {
    type: Number,
    default: 0
  },

  inputsArray: [{
    type: Schema.Types.ObjectId, ref: 'Input',
    required: true
  }],

  providerInputs: {
    type: Number,
    default: 0
  },

  providerInputsArray: [{
    type: Schema.Types.ObjectId, ref: 'ProviderInput',
    required: true
  }],

  outputs: {
    type: Number,
    default: 0
  },

  outputsArray: [{
    type: Schema.Types.ObjectId, ref: 'Output',
    required: true
  }],

  outgoings: {
    type: Number,
    default: 0
  },

  outgoingsArray: [{
    type: Schema.Types.ObjectId, ref: 'Outgoing',
    required: true
  }],

  incomes: {
    type: Number,
    default: 0
  },

  incomesArray: [{
    type: Schema.Types.ObjectId, ref: 'IncomeCollected',
    required: true
  }],

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
  },

  assistant: {
    type: Schema.Types.ObjectId, ref: 'Employee'
  },

  reportData: {
    type: Schema.Types.ObjectId, ref: 'ReportData'
  },

  dateSent: {
    type: Date
  }

}, { timestamps: { createdAt: true, updatedAt: false } })

const BranchReport = mongoose.model('BranchReport', branchReportSchema)

export default BranchReport