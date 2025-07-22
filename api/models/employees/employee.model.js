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

  companyData: [{
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    salary: { type: Number },
    payDay: { type: Number },
    balance: { type: Number, default: 0.0 },
    administrativeAccount: { type: Boolean, default: false }
  }],

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

  companies: [{
    type: Schema.Types.ObjectId, ref: 'Company'
  }],

  defaultCompany: {
    type: Schema.Types.ObjectId, ref: 'Company'
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

employeeSchema.index({ phoneNumber: 1 }, { unique: true })

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee