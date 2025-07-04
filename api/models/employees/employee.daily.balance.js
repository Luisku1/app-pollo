import mongoose, { Schema } from 'mongoose'

const employeeDailyBalanceSchema = mongoose.Schema({

  accountBalance: {
    type: Number,
    default: 0.0
  },

  supervisorBalance: {
    type: Number,
    default: 0.0
  },

  lateDiscount: {
    type: Boolean,
    default: false
  },

  dayDiscount: {
    type: Boolean,
    default: false
  },

  restDay: {
    type: Boolean,
    default: false,
  },

  penalties: {
    type: Number,
    default: 0.0
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

employeeDailyBalanceSchema.index({employee: 1, createdAt: -1}, {unique: true})
employeeDailyBalanceSchema.index({company: 1, employee: 1, createdAt: -1}, {unique: true})
const EmployeeDailyBalance = mongoose.model('EmployeeDailyBalance', employeeDailyBalanceSchema)

export default EmployeeDailyBalance