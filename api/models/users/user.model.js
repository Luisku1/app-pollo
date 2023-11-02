import { Decimal128 } from 'mongodb/mongodb'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema( {

    email: {
        type: String,
        required: true,
        unique: true,
    },

    name: {
        type: String,
        required: true,
    },

    lastname: {
        type: String,
        required: true,
    },

    salary: {
        type: Decimal128,
        required: true,
    },

    payDay: {
        type: String,
        require: true,
    },

    balance: {
        type: Decimal128,
        default: 0.0
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: Schema.Types.ObjectId, ref: 'Role',
        required: true
    },

}, { timestamps: true } )

const User = mongoose.model('User', userSchema)

export default User