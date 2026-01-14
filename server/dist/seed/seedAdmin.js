"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = seedAdmin;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AdminUser_1 = require("../models/AdminUser");
async function seedAdmin() {
    const email = "admin@shop.local";
    const password = "Admin123!";
    const exists = await AdminUser_1.AdminUserModel.findOne({ email });
    if (exists)
        return;
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    await AdminUser_1.AdminUserModel.create({ email, passwordHash });
    console.log("✅ Seed admin created:", email, "/", password);
}
