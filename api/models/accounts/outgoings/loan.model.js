import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const loanSchema = mongoose.Schema( {

    amount: {
        type: Number,
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    },

    user: {
        type: Schema.Types.ObjectId, ref: 'Employee',
        required: true
    }
}, { timestamps: true } )

const Loan = mongoose.model('Loan', loanSchema)

export default Loan