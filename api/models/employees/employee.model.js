import { Decimal128 } from 'mongodb'
import mongoose from 'mongoose'
const { Schema } = mongoose

const employeeSchema = new mongoose.Schema( {

    email: {
        type: String,
        required: true,
        unique: true,
    },

    name: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true,
    },

    phoneNumber: {
        type: String,
        unique: true
    },

    salary: {
        type: Decimal128,
        required: true,
    },

    payDay: {
        type: Number,
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

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true
    },

    active: {
        type: Boolean,
        default: true
    },

    role: {
        type: Schema.Types.ObjectId, ref: 'Role',
        required: true
    },

}, { timestamps: true } )

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee