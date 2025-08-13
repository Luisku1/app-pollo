import mongoose, { Schema } from 'mongoose'

const companySchema = mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  owner: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  }
}, {
  timestamps: true
})

companySchema.index({ name: 1, owner: 1 }, { unique: true })

const Company = mongoose.model('Company', companySchema)

export default Company