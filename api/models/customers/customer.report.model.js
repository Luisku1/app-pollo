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

  branchSales: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Input' }],
    default: []
  },

  sales: {
    type: Number,
    default: 0
  },

  directSales: {
    type: [{ type: Schema.Types.ObjectId, ref: 'ProviderInput' }],
    default: []
  },

  returns: {
    type: Number,
    default: 0
  },

  returnsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Output' }],
    default: []
  },

  payments: {
    type: Number,
    default: 0
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

customerReportSchema.index({ customer: 1, createdAt: -1 }, { unique: true })
customerReportSchema.index({ company: 1, createdAt: -1 })

const CustomerReport = mongoose.model('CustomerReport', customerReportSchema)

export default CustomerReport