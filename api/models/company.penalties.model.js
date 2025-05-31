import mongoose, { Schema } from 'mongoose'

const companyPenaltiesSchema = mongoose.Schema({

  name: {
    type: "String",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },

  weeklyBalanceField: {
    type: String
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

})
companyPenaltiesSchema.index({ company: 1, penalty: 1 }, { unique: true })
companyPenaltiesSchema.index({ company: 1, weeklyBalanceField: 1 }, { unique: true })
const CompanyPenalties = mongoose.model('CompanyPenalties', companyPenaltiesSchema)
export default CompanyPenalties
