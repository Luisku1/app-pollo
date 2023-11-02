import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const inputSchema = mongoose.Schema(
    {
        amount: {
            type: Decimal128,
            required: true
        },

        weight: {
            type: Decimal128,
            required: true
        },

        comment: {
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
    }, { timestamps: true }
)

const Input = mongoose.model('Input', inputSchema)

export default Input