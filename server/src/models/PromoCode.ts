import mongoose, { Schema, InferSchemaType } from "mongoose";

const promoSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["PERCENT", "FIXED"], required: true },
    value: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    expiry: { type: Date }
  },
  { timestamps: true }
);

export type PromoCode = InferSchemaType<typeof promoSchema>;
export const PromoCodeModel =
  mongoose.models.PromoCode || mongoose.model("PromoCode", promoSchema);
