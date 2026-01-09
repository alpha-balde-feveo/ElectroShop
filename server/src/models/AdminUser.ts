import mongoose, { Schema, InferSchemaType } from "mongoose";

const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export type AdminUser = InferSchemaType<typeof adminUserSchema>;
export const AdminUserModel =
  mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
