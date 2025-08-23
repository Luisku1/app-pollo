import mongoose, { Schema } from 'mongoose'

const branchReportSchema = mongoose.Schema({

  balanceAdjustments: {
    type: [{ type: Schema.Types.ObjectId, ref: 'EmployeeBalanceAdjustment' }],
    default: []
  },

  initialStock: {
    type: Number,
    default: 0
  },

  initialStockArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Stock' }],
    default: []
  },

  midDayStock: {
    type: Number,
    default: 0
  },

  midDayStockArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Stock' }],
    default: []
  },

  finalStock: {
    type: Number,
    default: 0
  },

  finalStockArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Stock' }],
    default: []  // Permitir arrays vacíos
  },

  inputs: {
    type: Number,
    default: 0
  },

  inputsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Input' }],
    default: []  // Permitir arrays vacíos
  },

  outputs: {
    type: Number,
    default: 0
  },

  outputsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Output' }],
    default: []  // Permitir arrays vacíos
  },

  providerInputs: {
    type: Number,
    default: 0
  },

  providerInputsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'ProviderInput' }],
    default: []  // Permitir arrays vacíos
  },

  outgoings: {
    type: Number,
    default: 0
  },

  outgoingsArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Outgoing' }],
    default: []  // Permitir arrays vacíos
  },

  onZero: {
    type: Boolean,
    default: false
  },

  incomes: {
    type: Number,
    default: 0
  },

  incomesArray: {
    type: [{ type: Schema.Types.ObjectId, ref: 'IncomeCollected' }],
    default: []  // Permitir arrays vacíos
  },

  balance: {
    type: Number,
    default: 0
  },

  company: {
    type: Schema.Types.ObjectId, ref: 'Company',
    required: true
  },

  branch: {
    type: Schema.Types.ObjectId, ref: 'Branch',
    required: true
  },

  employee: {
    type: Schema.Types.ObjectId, ref: 'Employee'
  },

  assistant: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    default: []
  },

  sender: {
    type: Schema.Types.ObjectId, ref: 'Employee'
  },

  pricesDate: {
    type: Date,
    required: true
  },

  residualPricesDate: {
    type: Date,
    required: true
  },

  dateSent: {
    type: Date
  }

  // Lightweight audit log for atomic updates in pushOrPullBranchReportRecord
  , logs: {
    type: [{
      op: { type: String, enum: ['add', 'remove'], required: true },
      array: { type: String, required: true },
      amountField: { type: String, required: true },
      record: { type: Schema.Types.ObjectId, default: null },
      amount: { type: Number, default: 0 },
      balanceDelta: { type: Number, default: 0 },
      employee: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  }

  // Raw string logs for easy client list rendering
  , logsRaw: {
    type: [String],
    default: []
  }

}, { timestamps: { createdAt: true, updatedAt: false } })

branchReportSchema.index({ createdAt: -1, branch: 1, employee: 1 }, { unique: true });

const BranchReport = mongoose.model('BranchReport', branchReportSchema)

export default BranchReport