import mongoose, { Schema } from 'mongoose'

const extraOutgoingsSchema = mongoose.Schema({

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

  partOfAPayment: {
    type: Boolean,
    required: true
  },

    company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const ExtraOutgoing = mongoose.model('ExtraOutgoing', extraOutgoingsSchema)

export default ExtraOutgoing