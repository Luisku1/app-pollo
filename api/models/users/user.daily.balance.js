import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const userDailyBalanceSchema = mongoose.Schema( {

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

    penalties: {
        type: Decimal128,
        default: 0.0
    },

    user: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    }

}, { timestamps: true } )

const UserDailyBalance = mongoose.model('UserDailyBalance', userDailyBalanceSchema)

export default UserDailyBalance