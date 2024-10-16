import mongoose, { Schema } from 'mongoose'

const supervisorReportSchema = mongoose.Schema({

  balance: {
    type: Number,
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

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  }

}, { timestamps: { createdAt: true, updatedAt: false } })

supervisorReportSchema.index({ createdAt: 1, employee: 1 })

const SupervisorReport = mongoose.model('SupervisorReport', supervisorReportSchema)

export default SupervisorReport