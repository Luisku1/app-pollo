import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const customerSchema = mongoose.Schema( {

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

const Customer = mongoose.model('Customer', customerSchema)

export default Customer