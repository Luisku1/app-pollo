import { Decimal128 } from 'mongodb'

const mongoose = require('mongoose')

const outgoingSchema = mongoose.Schema ( {

    amount: {
        type: Decimal128,
        required: true
    },

    concept: {
        type: String,
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch'
    }

}, { timestamps: true } )

const Outgoing = mongoose.model('Outgoing', outgoingsSchema)

export default Outgoing