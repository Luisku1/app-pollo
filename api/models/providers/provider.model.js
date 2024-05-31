import mongoose, { Schema } from 'mongoose'

const providerSchema = mongoose.Schema({

  name: {
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

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }
})

const Provider = mongoose.model('Provider', providerSchema)

export default Provider