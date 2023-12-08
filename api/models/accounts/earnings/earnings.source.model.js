import mongoose from 'mongoose'

const earningsSourceSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true
    }
})

const EarningsSource = mongoose.model('EarningSources', earningsSourceSchema)

export default EarningsSource