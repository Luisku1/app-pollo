import mongoose, { Schema } from 'mongoose'

const outgoingSchema = mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  concept: {
    type: String,
    required: true
  },

  addmitted: {
    type: Boolean,
    default: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const Outgoing = mongoose.model('Outgoing', outgoingSchema)

export default Outgoing