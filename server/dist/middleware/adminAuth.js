"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = adminAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function adminAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing Authorization Bearer token" });
    }
    const token = header.slice("Bearer ".length);
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ message: "Missing JWT_SECRET" });
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (payload.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        req.adminId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
