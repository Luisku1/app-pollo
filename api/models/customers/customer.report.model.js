import mongoose, { Schema } from 'mongoose'

const customerReportSchema = Schema({

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

  salesAmount: {
    type: Number,
    default: 0
  },

  paymentsAmount: {
    type: Number,
    default: 0
  },

  branchProducts: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Input' }],
    default: []
  },

  providerProducts: {
    type: [{ type: Schema.Types.ObjectId, ref: 'ProviderInput' }],
    default: []
  },

  returnsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Output' }],
    default: []
  },

  paymentsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'IncomesCollected' }],
    default: []
  },

  customer: {
    type: Schema.Types.ObjectId, ref: 'Customer',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  }

}, { timestamps: true })

customerReportSchema.index({ createdAt: -1, customer: 1 }, { unique: true })

const CustomerReport = mongoose.model('CustomerReport', customerReportSchema)

export default CustomerReport