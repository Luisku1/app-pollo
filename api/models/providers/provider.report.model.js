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

  returns: {
    type: Number,
    default: 0
  },

  purchases: {
    type: Number,
    default: 0
  },

  payments: {
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

providerReportSchema.index({ provider: 1, createdAt: -1 }, { unique: true }) //_id
providerReportSchema.index({ company: 1, provider: 1, createdAt: -1 })

const ProviderReport = mongoose.model('ProviderReport', providerReportSchema)

export default ProviderReport