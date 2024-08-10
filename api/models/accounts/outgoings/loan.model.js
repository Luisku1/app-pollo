import mongoose, { Schema } from 'mongoose'

const loanSchema = mongoose.Schema({

    amount: {
        type: Number,
        required: true
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    },

    employee: {
        type: Schema.Types.ObjectId, ref: 'Employee',
        required: true
    },

    supervisor: {
        type: Schema.Types.ObjectId, ref: 'Employee',
        required: true
    },

    createdAt: {
        type: Date,
        required: true
    }
}, {timestamps: true}, {createdAt: false, updatedAt: true})

const Loan = mongoose.model('Loan', loanSchema)

export default Loan