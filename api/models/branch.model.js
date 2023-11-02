import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const branchSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
    },

    p: {
        type: Decimal128,
        required: true
    },

    rentDay: {
        type: String,
        required: true
    },

    rentAmount: {
        type: Decimal128,
        required: true
    },

    zone: {
        type: Schema.Types.ObjectId, ref: 'Zone',
        required: true
    }
}, { timestamps: true } )

const Branch = mongoose.model('Branch', branchSchema)

export default Branch