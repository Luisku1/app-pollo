import mongoose from 'mongoose'
const { Schema } = mongoose

const employeePaymentSchema = new mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  detail: {
    type: String,
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  supervisor: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  extraOutgoing: {
    type: Schema.Types.ObjectId, ref: 'ExtraOutgoing',
    required: true
  },

  income: {
    type: Schema.Types.ObjectId, ref: 'IncomeCollected',
    required: true

  },

  createdAt: {
    type: Date,
    required: true
  }

}, { timestamps: { createdAt: false, updatedAt: true } })

const EmployeePayment = mongoose.model('EmployeePayment', employeePaymentSchema)

export default EmployeePayment