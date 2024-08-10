import mongoose, { Schema } from 'mongoose'

const customerSchema = mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  phoneNumber: {
    type: String,
    required: true
  },

  balance: {
    type: Number,
    default: 0.0
  },

  location: {
    type: String,
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }
})

const Customer = mongoose.model('Customer', customerSchema)

export default Customer