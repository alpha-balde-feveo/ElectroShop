"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminAuth_1 = require("../middleware/adminAuth");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const PromoCode_1 = require("../models/PromoCode");
const router = (0, express_1.Router)();
const createOrderSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(6),
    address: zod_1.z.string().min(3),
    city: zod_1.z.string().min(2),
    notes: zod_1.z.string().optional().default(""),
    shipping: zod_1.z.enum(["STANDARD", "EXPRESS"]).optional().default("STANDARD"),
    promoCode: zod_1.z.string().optional().default(""),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        qty: zod_1.z.coerce.number().int().min(1)
    }))
        .min(1)
});
// PUBLIC - create order
router.post("/", (0, express_async_handler_1.default)(async (req, res) => {
    const data = createOrderSchema.parse(req.body);
    const shippingFee = data.shipping === "EXPRESS" ? 3000 : 1500;
    const snapshots = [];
    let subtotal = 0;
    for (const item of data.items) {
        if (!mongoose_1.default.Types.ObjectId.isValid(item.productId)) {
            res.status(400).json({ message: "Invalid productId" });
            return;
        }
        const product = await Product_1.ProductModel.findById(item.productId);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (product.stock < item.qty) {
            res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            return;
        }
        subtotal += product.price * item.qty;
        snapshots.push({
            productId: product._id,
            nameSnapshot: product.name,
            priceSnapshot: product.price,
            qty: item.qty
        });
    }
    // Promo
    let discount = 0;
    const promoCode = data.promoCode.trim().toUpperCase();
    if (promoCode) {
        const promo = await PromoCode_1.PromoCodeModel.findOne({ code: promoCode, active: true });
        if (!promo) {
            res.status(400).json({ message: "Invalid promo code" });
            return;
        }
        if (promo.expiry && promo.expiry.getTime() < Date.now()) {
            res.status(400).json({ message: "Promo code expired" });
            return;
        }
        if (promo.type === "PERCENT")
            discount = Math.round((subtotal * promo.value) / 100);
        else
            discount = promo.value;
        if (discount > subtotal)
            discount = subtotal;
    }
    const total = subtotal - discount + shippingFee;
    // Stock decrement (simple)
    for (const s of snapshots) {
        await Product_1.ProductModel.findByIdAndUpdate(s.productId, { $inc: { stock: -s.qty } });
    }
    const order = await Order_1.OrderModel.create({
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        notes: data.notes,
        items: snapshots,
        promoCode,
        subtotal,
        discount,
        shippingFee,
        total,
        status: "PENDING"
    });
    res.status(201).json(order);
}));
// ADMIN - list orders
router.get("/", adminAuth_1.adminAuth, (0, express_async_handler_1.default)(async (_req, res) => {
    const orders = await Order_1.OrderModel.find().sort({ createdAt: -1 });
    res.json(orders);
}));
// ADMIN - order detail
router.get("/:id", adminAuth_1.adminAuth, (0, express_async_handler_1.default)(async (req, res) => {
    const order = await Order_1.OrderModel.findById(req.params.id);
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    res.json(order);
}));
// ADMIN - update status
router.put("/:id/status", adminAuth_1.adminAuth, (0, express_async_handler_1.default)(async (req, res) => {
    const schema = zod_1.z.object({
        status: zod_1.z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELED"])
    });
    const { status } = schema.parse(req.body);
    const updated = await Order_1.OrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    res.json(updated);
}));
exports.default = router;
