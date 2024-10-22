import mongoose, { Schema } from 'mongoose'

const employeeRestSchema = mongoose.Schema({

  date: {
    type: Date,
    required: true
  },

  replacement: {
    type: Schema.Types.ObjectId, ref: 'Employee',
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }
}, {timestamps: {createdAt: true, updatedAt: false}})

employeeRestSchema.index({date: 1}, {unique: true})

const EmployeeRest = mongoose.model('EmployeeRest', employeeRestSchema)

export default EmployeeRest