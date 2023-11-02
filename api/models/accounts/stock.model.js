import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const stockSchema = mongoose.Schema( {

    pieces: {
        type: Number,
        required: true
    },

    weight: {
        type: Decimal128,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    },

    product: {
        type: Schema.Types.ObjectId, ref: 'Product',
        required: true
    }
}, { timestamps: true } )

const Stock = mongoose.model('Stock', stockSchema)

export default Stock