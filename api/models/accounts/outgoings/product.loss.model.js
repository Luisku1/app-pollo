import mongoose, { Schema } from 'mongoose'

const productLossSchema = mongoose.Schema( {

    amount: {
        type: Number,
        required: true
    },

    weight: {
        type: Number,
        required: true
    },

    comment: {
        type: String,
        required: true
    },

    admitted: {
        type: Boolean,
        default: true
    },

    product: {
        type: Schema.Types.ObjectId, ref: 'Product',
        required: true
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    },

    employee: {

        type: Schema.Types.ObjectId, ref: 'Employee',
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    },

    createdAt: {
        type: Date,
        required: true
    }
})

const ProductLoss = mongoose.model('ProductLoss', productLossSchema)

export default ProductLoss