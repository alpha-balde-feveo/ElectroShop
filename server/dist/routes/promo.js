"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminAuth_1 = require("../middleware/adminAuth");
const PromoCode_1 = require("../models/PromoCode");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).transform((s) => s.toUpperCase().trim()),
    type: zod_1.z.string().transform((s) => s.toUpperCase()).pipe(zod_1.z.enum(["PERCENT", "FIXED"])),
    value: zod_1.z.coerce.number().nonnegative(),
    active: zod_1.z.coerce.boolean().optional().default(true),
    expiry: zod_1.z.coerce.date().optional()
});
// PUBLIC - validate
router.post("/validate", (0, express_async_handler_1.default)(async (req, res) => {
    const schema = zod_1.z.object({
        code: zod_1.z.string().min(2).transform((s) => s.toUpperCase().trim())
    });
    const { code } = schema.parse(req.body);
    const promo = await PromoCode_1.PromoCodeModel.findOne({ code, active: true });
    if (!promo) {
        res.status(404).json({ message: "Invalid promo code" });
        return;
    }
    if (promo.expiry && promo.expiry.getTime() < Date.now()) {
        res.status(400).json({ message: "Promo code expired" });
        return;
    }
    res.json({ code: promo.code, type: promo.type, value: promo.value });
}));
// ADMIN - list
router.get("/", adminAuth_1.adminAuth, (0, express_async_handler_1.default)(async (_req, res) => {
    const promos = await PromoCode_1.PromoCodeModel.find().sort({ createdAt: -1 });
    res.json(promos);
}));
// ADMIN - create
router.post("/", adminAuth_1.adminAuth, (0, express_async_handler_1.default)(async (req, res) => {
    const data = createSchema.parse(req.body);
    const existing = await PromoCode_1.PromoCodeModel.findOne({ code: data.code });
    if (existing) {
        res.status(409).json({ message: "Promo code already exists" });
        return;
    }
    const created = await PromoCode_1.PromoCodeModel.create(data);
    res.status(201).json(created);
}));
// ADMIN - update
router.put("/:id", adminAuth_1.adminAuth, (0, express_async_handler_1.default)(async (req, res) => {
    const data = createSchema.partial().parse(req.body);
    const updated = await PromoCode_1.PromoCodeModel.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) {
        res.status(404).json({ message: "Promo not found" });
        return;
    }
    res.json(updated);
}));
// ADMIN - delete
router.delete("/:id", adminAuth_1.adminAuth, (0, express_async_handler_1.default)(async (req, res) => {
    const deleted = await PromoCode_1.PromoCodeModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
        res.status(404).json({ message: "Promo not found" });
        return;
    }
    res.status(204).send();
}));
exports.default = router;
