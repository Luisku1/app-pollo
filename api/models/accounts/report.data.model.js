import mongoose, { Schema } from 'mongoose'

const reportDataSchema = mongoose.Schema( {

    sales: {
        type: Number,
        required: true
    },

    profits: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        required: true
    },

    outgoings: {
        type: Number,
        required: true
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company'
    }

}, { timestamps: true } )

const ReportData = mongoose.model('ReportData', reportDataSchema)

export default ReportData