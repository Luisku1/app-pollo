import mongoose from 'mongoose'

const incomeTypeSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true,
        unique: true
    }

}, {timestamps: {createdAt: true, updatedAt: false}})

const IncomeType = mongoose.model('IncomeType', incomeTypeSchema)

export default IncomeType