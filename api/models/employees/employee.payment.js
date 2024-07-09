import mongoose from 'mongoose'
const { Schema } = mongoose

const employeePaymentSchema = new Mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  }

}, { timestamps: true })

const EmployeePayment = mongoose.model('EmployeePayment', employeePaymentSchema)