import mongoose, { Schema } from 'mongoose'

const customerSaleSchema = mongoose.Schema({

  weight: {
    type: Number,
    required: true
  },

  amount: {
    type: Number,
    default: 0.0
  },

  comment: {
    type: String,
    required: true
  },

  precentageIncluded: {
    type: Boolean,
    required: true
  },

  product: {
    type: Schema.Types.ObjectId, ref: 'Product'
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  customer: {
    type: Schema.Types.ObjectId, ref: 'Customer',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

const CustomerSale = mongoose.model('CustomerSale', customerSaleSchema)

export default CustomerSale