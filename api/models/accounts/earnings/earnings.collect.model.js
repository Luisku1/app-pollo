import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const earningsCollectedSchema = mongoose.Schema( {

    amount: {
        type: Decimal128,
        required: true
    },

    comment: {
        type: Decimal128,
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    },

    user: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },

    source: {
        type: Schema.Types.ObjectId, ref:'EarningsSource'
    }

}, { timestamps: true} )

const EarningsCollected = mongoose.model('EarningsCollected', earningsCollectedSchema)

export default EarningsCollected