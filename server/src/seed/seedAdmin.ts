import bcrypt from "bcrypt";
import { AdminUserModel } from "../models/AdminUser";

export async function seedAdmin() {
  const email = "admin@shop.local";
  const password = "Admin123!";

  const exists = await AdminUserModel.findOne({ email });
  if (exists) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await AdminUserModel.create({ email, passwordHash });

  console.log("✅ Seed admin created:", email, "/", password);
}
