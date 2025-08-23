import mongoose, { Schema } from 'mongoose'

const extraOutgoingsSchema = mongoose.Schema({

  amount: {
    type: Number,
    required: true
  },

  concept: {
    type: String,
    required: true
  },

  addmitted: {
    type: Boolean,
    default: true
  },

  // Polymorphic link to the originating document (EmployeePayment or IncomeCollected)
  linkedModel: {
    type: String,
    enum: ['EmployeePayment', 'IncomeCollected'],
    default: null
  },

  linked: {
    type: Schema.Types.ObjectId,
    refPath: 'linkedModel',
    default: null
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee',
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  }
})

// Helpful indexes for common queries
extraOutgoingsSchema.index({ company: 1, createdAt: -1 })
extraOutgoingsSchema.index({ linkedModel: 1, linked: 1 })

const ExtraOutgoing = mongoose.model('ExtraOutgoing', extraOutgoingsSchema)

export default ExtraOutgoing