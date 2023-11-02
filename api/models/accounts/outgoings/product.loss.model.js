import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'


const productLossSchema = mongoose.Schema( {

    weight: {
        type: Decimal128,
        required: true
    },

    amount: {
        type: Decimal128,
        required: true
    },

    admitted: {
        type: Boolean,
        required: true,
        defaultl: false
    },

    product: {
        type: Schema.Types.ObjectId, ref: 'Product',
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    }
}, { timestamps: true } )

const ProductLoss = mongoose.model('ProductLoss', productLossSchema)

export default ProductLoss