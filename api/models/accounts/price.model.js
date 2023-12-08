import mongoose, { Schema } from 'mongoose'

const priceSchema = mongoose.Schema( {

    price: {
        type: String,
        required: true
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

const Price = mongoose.model('Price', priceSchema)

export default Price