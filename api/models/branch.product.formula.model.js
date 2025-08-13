import { Schema, mongoose } from 'mongoose';

const BranchProductFormulaSchema = new Schema({
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  formula: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

BranchProductFormulaSchema.index({ branchId: 1, productId: 1 }, { unique: true });

const BranchProductFormula = mongoose.model('BranchProductFormula', BranchProductFormulaSchema);

export default BranchProductFormula;