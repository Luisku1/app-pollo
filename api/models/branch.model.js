import { Decimal128 } from 'mongodb'
import mongoose, { Schema } from 'mongoose'

const branchSchema = mongoose.Schema( {

    branch: {
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

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    },

    zone: {
        type: Schema.Types.ObjectId, ref: 'Zone',
    }

}, { timestamps: true } )

const Branch = mongoose.model('Branch', branchSchema)

export default Branch