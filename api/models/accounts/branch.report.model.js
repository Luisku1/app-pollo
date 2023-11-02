import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const branchReportSchema = mongoose.Schema( {

    initialStock: {
        type: Number,
        required: true
    },

    finalStock: {
        type: Number,
        required: true
    },

    inputs: {
        type: Number,
        required: true
    },

    outputs: {
        type: Number,
        required: true
    },

    outgoings: {
        type: Number,
        required: true
    },

    earnings: {
        type: Number,
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    },

    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    }

}, { timestamps: true })

const BranchReport = mongoose.model('BranchReport', branchReportSchema)

export default BranchReport