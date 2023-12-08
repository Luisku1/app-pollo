import mongoose from 'mongoose'
const { Schema } = mongoose

const earningsCollectedSchema = mongoose.Schema( {

    amount: {
        type: Decimal128,
        required: true
    },

    comment: {
        type: String,
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    },

    employee: {
        type: Schema.Types.ObjectId, ref: 'Employee',
        required: true
    },

    source: {
        type: Schema.Types.ObjectId, ref:'EarningsSource'
    }

}, { timestamps: true} )

const EarningsCollected = mongoose.model('EarningsCollected', earningsCollectedSchema)

export default EarningsCollected