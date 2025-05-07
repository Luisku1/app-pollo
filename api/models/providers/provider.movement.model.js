import mongoose, { Schema } from "mongoose";

const providerMovementsSchema = mongoose.Schema(
  {
    isReturn: {
      type: Boolean,
      default: false,
    },

    weight: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    pieces: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    comment: {
      type: String,
    },

    specialPrice: {
      type: Boolean,
      default: false,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
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

providerMovementsSchema.index({ createdAt: -1, provider: 1 });
providerMovementsSchema.index({ company: 1, createdAt: -1, provider: 1 });

const ProviderMovements = mongoose.model(
  "ProviderMovements",
  providerMovementsSchema
);

export default ProviderMovements;
