import mongoose from 'mongoose'

const earningSourcesSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true
    }
})

const EarningsSource = mongoose.model('EarningSources', earningSourcesSchema)

export default EarningSources