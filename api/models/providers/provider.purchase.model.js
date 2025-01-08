import mongoose, { Schema } from 'mongoose'

const providerPurchaseSchema = mongoose.Schema({

  weight: {
    type: Number,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  pieces: {
    type: Number,
    required: true
  },

  comment: {
    type: String,
    validate: {
      validator: function(v) {
        return v.length <= 200;
      },
      message: 'Comment should be less than 200 characters'
    }
  },

  isReturn: {
    type: Boolean,
    default: false
  },

  specialPrice: {
    type: Boolean,
    default: false
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  supervisor: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  provider: {
    type: Schema.Types.ObjectId, ref: 'Provider',
    required: true
  }

}, { timestamps: true })

providerPurchaseSchema.index({ createdAt: -1, provider: 1 }, { unique: true })
providerPurchaseSchema.index({ company: 1, createdAt: -1, provider: 1 }, { unique: true })
const ProviderPurchase = mongoose.model('ProviderPurchase', providerPurchaseSchema)

export default ProviderPurchase