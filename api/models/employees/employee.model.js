import mongoose from 'mongoose'
const { Schema } = mongoose

const employeeSchema = new mongoose.Schema({

  phoneNumber: {
    type: String,
    unique: true
  },

  name: {
    type: String,
    required: true,
  },

  lastName: {
    type: String
  },

  salary: {
    type: Number,
  },

  payDay: {
    type: Number,
  },

  balance: {
    type: Number,
    default: 0.0
  },

  password: {
    type: String,
    required: true,
  },

  active: {
    type: Boolean,
    default: true
  },

  administrativeAccount: {
    type: Boolean,
    default: false
  },

  hiredBy: {
    type: Schema.Types.ObjectId, ref: 'Employee',
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
  },

  role: {
    type: Schema.Types.ObjectId, ref: 'Role',
    required: true
  }

}, { timestamps: { createdAt: true, updatedAt: true } })

employeeSchema.index({ phoneNumber: 1, company: 1 }, { unique: true })

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee