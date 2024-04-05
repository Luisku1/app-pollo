import mongoose from 'mongoose'

const incomeTypeSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true,
        unique: true
    },

    createdAt: {
        type: Date,
        required: true
    }
})

const IncomeType = mongoose.model('IncomeType', incomeTypeSchema)

export default IncomeType