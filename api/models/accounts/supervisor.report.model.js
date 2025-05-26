import mongoose, { Schema } from 'mongoose'

const supervisorReportSchema = mongoose.Schema({

  balanceAdjustments: {
    type: [{ type: Schema.Types.ObjectId, ref: 'EmployeeBalanceAdjustment' }],
    default: []
  },

  balance: {
    type: Number,
    default: 0
  },

  verifiedCash: {
    type: Number,
    default: 0,
    required: true
  },

  verifiedDeposits: {
    type: Number,
    required: true,
    default: 0
  },

  incomes: {
    type: Number,
    default: 0
  },

  incomesArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'IncomeCollected' }],
    default: []
  },

  extraOutgoings: {
    type: Number,
    default: 0
  },

  extraOutgoingsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Outgoing' }],
    default: []
  },

  supervisor: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

}, { timestamps: { createdAt: true, updatedAt: false } })

supervisorReportSchema.index({ supervisor: 1, createdAt: -1})
supervisorReportSchema.index({ company: 1, supervisor: 1, createdAt: -1 })

const SupervisorReport = mongoose.model('SupervisorReport', supervisorReportSchema)

export default SupervisorReport