"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const router = (0, express_1.Router)();
router.get("/", adminAuth_1.adminAuth, async (_req, res) => {
    const ordersCount = await Order_1.OrderModel.countDocuments();
    const revenueAgg = await Order_1.OrderModel.aggregate([
        { $match: { status: { $ne: "CANCELED" } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const lowStock = await Product_1.ProductModel.countDocuments({ stock: { $lte: 3 } });
    res.json({
        ordersCount,
        revenue: revenueAgg[0]?.total ?? 0,
        lowStock
    });
});
exports.default = router;
