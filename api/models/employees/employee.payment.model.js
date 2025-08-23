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
  },

  // Optional polymorphic link to related document (ExtraOutgoing or IncomeCollected)
  linkedModel: {
    type: String,
    enum: ['ExtraOutgoing', 'IncomeCollected'],
    default: null
  },

  linked: {
    type: Schema.Types.ObjectId,
    refPath: 'linkedModel',
    default: null
  },

}, { timestamps: true })

employeePaymentSchema.index({ createdAt: -1, employee: 1 }, { unique: true })
employeePaymentSchema.index({ linkedModel: 1, linked: 1 })

const EmployeePayment = mongoose.model('EmployeePayment', employeePaymentSchema)

export default EmployeePayment