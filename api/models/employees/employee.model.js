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
    type: String,
    required: true,
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

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
  },

  role: {
    type: Schema.Types.ObjectId, ref: 'Role',
    required: true
  }
})

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee