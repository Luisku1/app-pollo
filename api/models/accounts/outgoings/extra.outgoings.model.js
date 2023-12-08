import mongoose, { Schema } from 'mongoose'

const extraOutgoingsSchema = mongoose.Schema( {

    amount: {
        type: Decimal128,
        required: true
    },

    concept: {
        type: String,
        required: true
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    },

    employee: {
        type: Schema.Types.ObjectId, ref: 'Employee',
        required: true
    }

}, { timestamps: true } )

const ExtraOutgoings = mongoose.model('ExtraOutgoings', extraOutgoingsSchema)

export default ExtraOutgoings