import mongoose, { Schema, InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    // Adresse facultative pour le retrait en boutique
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },

    items: { type: [orderItemSchema], required: true },

    shippingMode: {
      type: String,
      enum: ["STANDARD", "EXPRESS", "PICKUP"],
      default: "STANDARD"
    },
    paymentMethod: {
      type: String,
      enum: ["ON_DELIVERY", "WAVE", "CASH_ON_SITE"],
      default: "ON_DELIVERY"
    },

    promoCode: { type: String, default: "" },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
