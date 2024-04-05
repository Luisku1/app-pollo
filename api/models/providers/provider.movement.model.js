import mongoose, { Schema } from 'mongoose'

const providerMovementSchema = mongoose.Schema({

  weight: {
    type: Decimal128,
    required: true
  },

  price: {
    type: Decimal128,
    required: true
  },

  comment: {
    type: String,
  },

  provider: {
    type: Schema.Types.ObjectId, ref: 'Provider',
    required: true
  },

  destiny: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const ProviderMovement = mongoose.model('ProviderMovement', providerMovementSchema)

export default ProviderMovement