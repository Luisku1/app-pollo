import mongoose, { Schema } from 'mongoose'

const employeeWeeklyBalanceSchema = mongoose.Schema({

  balance: {
    type: Number,
    default: 0.0
  },

  previousWeekBalance: {
    type: Number,
    default: 0.0
  },

  branchReportsBalance: {
    type: Number,
    default: 0.0
  },

  supervisorReportsBalance: {
    type: Number,
    default: 0.0
  },

  weekStart: {
    type: Date,
    required: true
  },

  weekEnd: {
    type: Date,
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

}, { timestamps: { createdAt: true, updatedAt: false } })

employeeWeeklyBalanceSchema.index({ weekStart: -1, employee: 1 }, { unique: true })

const EmployeeWeeklyBalance = mongoose.model('EmployeeWeeklyBalance', employeeWeeklyBalanceSchema)

export default EmployeeWeeklyBalance