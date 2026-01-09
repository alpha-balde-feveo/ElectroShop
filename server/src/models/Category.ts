import mongoose, { Schema, InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  { timestamps: true }
);

export type Category = InferSchemaType<typeof categorySchema>;

export const CategoryModel =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
