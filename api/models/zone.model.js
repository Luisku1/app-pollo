import mongoose, { Schema } from 'mongoose'

const zoneSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true,
        unique: true
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    }

}, { timestamps: true } )

const Zone = mongoose.model('Zone', zoneSchema)

export default Zone