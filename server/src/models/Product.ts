import mongoose, { Schema, InferSchemaType } from "mongoose";

const productImageSchema = new Schema(
  {
    url: { type: String, required: true },
    // Libellé de variante (ex : "Bleu", "Rouge", "128 Go")
    label: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "", trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },

    description: { type: String, default: "", trim: true },

    // specs: objet libre (CPU, RAM, etc.)
    specs: { type: Schema.Types.Mixed, default: {} },

    stock: { type: Number, required: true, min: 0 },

    images: { type: [productImageSchema], default: [] }
  },
  { timestamps: true }
);

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);
