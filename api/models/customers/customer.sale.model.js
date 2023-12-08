import mongoose, { Schema } from 'mongoose'

const customerSaleSchema = mongoose.Schema( {

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
        required: true
    },

    folio: {
        type: String,
        required: true,
        unique: true
    },

    product: {
        type: Schema.Types.ObjectId, ref: 'Product'
    },

    customer: {
        type: Schema.Types.ObjectId, ref: 'Customer',
        required: true
    }

}, { timestamps: true } )

const CustomerSale = mongoose.model('CustomerSale', customerSaleSchema)

export default CustomerSale