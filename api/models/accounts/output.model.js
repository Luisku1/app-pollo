const { Decimal128 } = require('mongodb/mongodb')
const mongoose = require('mongoose')

const outputSchema = mongoose.Schema ( {

    price: {
        type: Number,
        required: true
    },

    amount: {
        type: Decimal128,
        required: true
    },

    comment: {
        type: String,
        required: true
    },

    weight: {
        type: Decimal128,
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    }
}, { timestamps: true } )

const Output = mongoose.model('Output', outputSchema)

export default Output