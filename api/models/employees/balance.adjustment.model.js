import mongoose, { Schema } from "mongoose";

const employeeBalanceAdjustmentSchema = mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },

  concept: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },

}, { timestamps: { createdAt: true, updatedAt: false } })


const EmployeeBalanceAdjustment = mongoose.model('EmployeeBalanceAdjustment', employeeBalanceAdjustmentSchema)
export default EmployeeBalanceAdjustment