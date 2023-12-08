import mongoose, { Schema } from 'mongoose'

const employeeDailyBalanceSchema = mongoose.Schema( {

    lostMoney: {
        type: Decimal128,
        default: 0.0
    },

    lostProduct: {
        type: Decimal128,
        default: 0.0
    },

    loan: {
        type: Decimal128,
        default: 0.0
    },

    foodDiscount: {
        type: Boolean,
        default: false
    },

    dayDiscount: {
        type: Boolean,
        default: false
    },

    restDay: {

        type: Boolean,
        default: false,
    },

    penalties: {
        type: Decimal128,
        default: 0.0
    },

    employee: {
        type: Schema.Types.ObjectId, ref: 'Employee',
        required: true
    }

}, { timestamps: true } )

const EmployeeDailyBalance = mongoose.model('EmployeeDailyBalance', employeeDailyBalanceSchema)

export default EmployeeDailyBalance