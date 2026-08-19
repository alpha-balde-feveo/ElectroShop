import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { AdminUserModel } from "../models/AdminUser";
import { adminAuth } from "../middleware/adminAuth";


const router = Router();

// 10 tentatives / 15 min par IP — freine le bruteforce sur le mot de passe admin.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de tentatives de connexion, réessayez dans 15 minutes." }
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "email et password sont obligatoires" });
  }

  const admin = await AdminUserModel.findOne({ email: email.toLowerCase() });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: "Missing JWT_SECRET" });

  const token = jwt.sign({ sub: admin._id.toString(), role: "admin" }, secret, { expiresIn: "2h" });

  return res.json({ token });
});

router.get("/me", adminAuth, async (req, res) => {
  return res.json({ ok: true, adminId: (req as any).adminId });
});


export default router;
