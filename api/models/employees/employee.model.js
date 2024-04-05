import mongoose from 'mongoose'
const { Schema } = mongoose

const employeeSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    unique: true
  },

  salary: {
    type: String,
  },

  payDay: {
    type: Number,
  },

  balance: {
    type: String,
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