import mongoose, { Schema } from 'mongoose'

const branchSchema = mongoose.Schema({

  branch: {
    type: String,
    unique: true,
    required: true,
  },

  location: {
    type: String,
    required: true
  },

  phoneNumber: {
    type: String,
  },

  p: {
    type: Number,
    required: true
  },

  rentDay: {
    type: String,
    required: true
  },

  rentAmount: {
    type: Number,
    required: true
  },

  position: {
    type: Number,
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  zone: {
    type: Schema.Types.ObjectId, ref: 'Zone',
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const Branch = mongoose.model('Branch', branchSchema)

export default Branch