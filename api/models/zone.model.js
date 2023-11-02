import mongoose from 'mongoose'

const zoneSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true
    }
}, { timestamps: true } )

const Zone = mongoose.model('Zone', zoneSchema)

export default Zone