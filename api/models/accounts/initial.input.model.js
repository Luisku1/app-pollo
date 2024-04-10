import mongoose, { Schema } from 'mongoose'


const initialInputSchema = mongoose.Schema({

  weight: {
    type: Number,
    default: 0.0
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    default: null
  },

}, {timestamps: true})

const InitialInput = mongoose.model('InitialInput', initialInputSchema)

export default InitialInput