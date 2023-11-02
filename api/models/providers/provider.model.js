import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const providerSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    balance: {
        type: Decimal128,
        default: 0.0
    }
}, { timestamps: true } )

const Provider = mongoose.model('Provider', providerSchema)

export default Provider