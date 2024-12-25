import mongoose from 'mongoose'
const { Schema } = mongoose

const employeePaymentSchema = new mongoose.Schema({

  amount: {
    type: Number,
    required: true,
    min: [1, 'El monto debe ser mayor a 0']
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
    validate: {
      validator: function (v) {
        return v != null;
      },
      message: 'Income is required'
    }
  },

}, { timestamps: true })

employeePaymentSchema.index({ createdAt: -1, employee: 1 }, { unique: true })

const EmployeePayment = mongoose.model('EmployeePayment', employeePaymentSchema)

export default EmployeePayment