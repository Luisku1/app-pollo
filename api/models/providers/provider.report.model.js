import mongoose, { Schema } from 'mongoose'

const providerReportSchema = Schema({

  balance: {
    type: Number,
    default: 0
  },

  previousBalance: {
    type: Number,
    default: 0
  },

  returnsAmount: {
    type: Number,
    default: 0
  },

  purchasesAmount: {
    type: Number,
    default: 0
  },

  paymentsAmount: {
    type: Number,
    default: 0
  },

  purchasesArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'ProviderPurchase' }],
    default: []
  },

  returnsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'ProviderReturns' }],
    default: []
  },

  paymentsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'ProviderPayment' }],
    default: []
  },

  provider: {
    type: Schema.Types.ObjectId, ref: 'Provider',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }

}, { timestamps: true })

providerReportSchema.index({ createdAt: -1, provider: 1 }, { unique: true })

const ProviderReport = mongoose.model('ProviderReport', providerReportSchema)

export default ProviderReport