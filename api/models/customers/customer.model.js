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
    default: 0
  },

  address: {
    type: String
  },

  active: {
    type: Boolean,
    default: true
  },

  location: {
    type: String
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }

}, {timestamps: {createdAt: true, updatedAt: false}})

customerSchema.index({phoneNumber: 1, company: 1}, {unique: true})

const Customer = mongoose.model('Customer', customerSchema)

export default Customer