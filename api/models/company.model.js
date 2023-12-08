import mongoose, { Schema } from 'mongoose'

const companySchema = mongoose.Schema( {

    name: {
        type: String,
        required: true
    },

    owner: {
        type: Schema.Types.ObjectId, ref: 'Owner',
        required: true
    }

}, { timestamps: true } )

const Company = mongoose.model('Company', companySchema)

export default Company