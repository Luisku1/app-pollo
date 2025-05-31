import mongoose, { Schema } from 'mongoose'

const employeeWeeklyBalanceSchema = mongoose.Schema({

  nextWeekBalance: {
    type: Number,
    default: 0.0
  },

  balance: {
    type: Number,
    default: 0.0
  },

  previousWeekBalance: {
    type: Number,
    default: 0.0
  },

  adjustments: {
    type: Number,
    default: 0.0
  },

  balanceAdjustments: {
    type: [{ type: Schema.Types.ObjectId, ref: 'EmployeeBalanceAdjustment' }],
    default: []
  },

  employeeDailyBalances: {
    type: [{ type: Schema.Types.ObjectId, ref: 'EmployeeDailyBalance' }],
    default: []
  },

  lastWeekBalance: {
    type: Number,
    default: 0.0
  },

  currentPayDay: {
    type: Number,
    default: 0
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
employeeWeeklyBalanceSchema.index({ employee: 1, weekStart: -1 })
employeeWeeklyBalanceSchema.index({ company: 1, weekStart: -1 })
employeeWeeklyBalanceSchema.index({ weekStart: -1, weekEnd: 1, employee: 1 })

const EmployeeWeeklyBalance = mongoose.model('EmployeeWeeklyBalance', employeeWeeklyBalanceSchema)

export default EmployeeWeeklyBalance