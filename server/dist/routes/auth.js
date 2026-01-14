"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AdminUser_1 = require("../models/AdminUser");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "email et password sont obligatoires" });
    }
    const admin = await AdminUser_1.AdminUserModel.findOne({ email: email.toLowerCase() });
    if (!admin)
        return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt_1.default.compare(password, admin.passwordHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ message: "Missing JWT_SECRET" });
    const token = jsonwebtoken_1.default.sign({ sub: admin._id.toString(), role: "admin" }, secret, { expiresIn: "2h" });
    return res.json({ token });
});
router.get("/me", adminAuth_1.adminAuth, async (req, res) => {
    return res.json({ ok: true, adminId: req.adminId });
});
exports.default = router;
