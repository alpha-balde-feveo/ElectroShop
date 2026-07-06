import bcrypt from "bcrypt";
import { AdminUserModel } from "../models/AdminUser";

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD non définis — seed admin ignoré.");
    return;
  }

  const exists = await AdminUserModel.findOne({ email });
  if (exists) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await AdminUserModel.create({ email, passwordHash });

  console.log("✅ Seed admin created:", email);
}
