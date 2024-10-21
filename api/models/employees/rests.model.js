import mongoose, { Schema } from 'mongoose'

const restsSchema = mongoose.Schema({

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