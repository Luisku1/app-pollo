import mongoose, { Schema } from 'mongoose'

const providerSchema = mongoose.Schema({

  name: {
    type: String,
    required: true,
    uniquie: true
  },

  phoneNumber: {
    type: String,
    required: true
  },

  active: {
    type: Boolean,
    default: true
  },

  location: {
    type: String,
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }
}, {timestamps: {createdAt: true, updatedAt: false}})

providerSchema.index({phoneNumber: 1, company: 1}, {unique: true})

const Provider = mongoose.model('Provider', providerSchema)

export default Provider