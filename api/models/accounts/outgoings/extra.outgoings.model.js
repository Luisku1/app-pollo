import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const extraOutgoingsSchema = mongoose.Schema( {

    amount: {
        type: Decimal128,
        required: true
    },

    concept: {
        type: String,
        required: true
    },

    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    }
}, { timestamps: true } )

const ExtraOutgoings = mongoose.model('ExtraOutgoings', extraOutgoingsSchema)

export default ExtraOutgoings