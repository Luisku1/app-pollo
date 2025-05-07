import mongoose, { Schema } from "mongoose";

const providerPaymentSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },

    amountCash: {
      type: Number,
      required: true,
    },

    isCash: {
      type: Boolean,
      required: true,
    },

    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

providerPaymentSchema.index({ createdAt: -1, provider: 1 });
providerPaymentSchema.index({ company: 1, createdAt: -1, provider: 1 });
const ProviderPayment = mongoose.model(
  "ProviderPayment",
  providerPaymentSchema
);

export default ProviderPayment;
