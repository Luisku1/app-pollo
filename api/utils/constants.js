export const transactionSchema = {
  price: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  weight: { type: Number, required: true, min: 0 },
  pieces: { type: Number, required: true, min: 1 },
  specialPrice: { type: Boolean, default: false },
  comment: { type: String },
};