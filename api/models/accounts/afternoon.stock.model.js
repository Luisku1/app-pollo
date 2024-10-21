import mongoose from 'mongoose'
const { Schema } = mongoose

const afternoonStockSchema = new Mongoose.Schema({

  pieces: {
    type: Number,
    required: true
  },

  weight: {
    type: Number,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

}, { timestamps: true })

const AfternoonStock = mongoose.model('AfternoonReport', afternoonStockSchema)

export default AfternoonStock