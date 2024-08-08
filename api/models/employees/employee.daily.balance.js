import mongoose, { Schema } from 'mongoose'

const employeeDailyBalanceSchema = mongoose.Schema({

  accountBalance: {
    type: Number,
    default: 0.0
  },

  loan: {
    type: Number,
    default: 0.0
  },

  foodDiscount: {
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


employeeDailyBalanceSchema.index({createdAt: 1, employee: 1}, {unique: true})
const EmployeeDailyBalance = mongoose.model('EmployeeDailyBalance', employeeDailyBalanceSchema)

export default EmployeeDailyBalance