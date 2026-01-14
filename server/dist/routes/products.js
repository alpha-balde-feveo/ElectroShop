"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const adminAuth_1 = require("../middleware/adminAuth");
const Product_1 = require("../models/Product");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    brand: zod_1.z.string().optional().default(""),
    categoryId: zod_1.z.string().min(1),
    // accepte nombre ou string convertible
    price: zod_1.z.coerce.number().nonnegative(),
    oldPrice: zod_1.z.coerce.number().nonnegative().optional(),
    description: zod_1.z.string().optional().default(""),
    // specs libre (objet ou autre) => on accepte unknown
    specs: zod_1.z.unknown().optional().default({}),
    stock: zod_1.z.coerce.number().int().nonnegative(),
    images: zod_1.z
        .array(zod_1.z.object({ url: zod_1.z.string().min(1) }))
        .optional()
        .default([])
});
const updateSchema = createSchema.partial();
router.get("/", async (req, res) => {
    const q = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "new";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const filter = {};
    if (q)
        filter.name = { $regex: q, $options: "i" };
    if (category && mongoose_1.default.Types.ObjectId.isValid(category))
        filter.categoryId = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (!Number.isNaN(minPrice) && minPrice !== undefined)
            filter.price.$gte = minPrice;
        if (!Number.isNaN(maxPrice) && maxPrice !== undefined)
            filter.price.$lte = maxPrice;
    }
    const sortMap = {
        new: { createdAt: -1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        name_asc: { name: 1 }
    };
    const products = await Product_1.ProductModel.find(filter)
        .populate("categoryId")
        .sort(sortMap[sort] ?? sortMap.new);
    res.json(products);
});
router.get("/:id", async (req, res) => {
    const product = await Product_1.ProductModel.findById(req.params.id).populate("categoryId");
    if (!product)
        return res.status(404).json({ message: "Product not found" });
    res.json(product);
});
router.post("/", adminAuth_1.adminAuth, async (req, res) => {
    try {
        const data = createSchema.parse(req.body);
        if (!mongoose_1.default.Types.ObjectId.isValid(data.categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }
        const created = await Product_1.ProductModel.create({
            ...data,
            categoryId: new mongoose_1.default.Types.ObjectId(data.categoryId)
        });
        return res.status(201).json(created);
    }
    catch (err) {
        // Zod error lisible
        return res.status(400).json({
            message: "Bad Request",
            error: err?.errors ?? err?.issues ?? String(err)
        });
    }
});
router.put("/:id", adminAuth_1.adminAuth, async (req, res) => {
    const data = updateSchema.parse(req.body);
    if (data.categoryId && !mongoose_1.default.Types.ObjectId.isValid(data.categoryId)) {
        return res.status(400).json({ message: "Invalid categoryId" });
    }
    const update = { ...data };
    if (data.categoryId)
        update.categoryId = new mongoose_1.default.Types.ObjectId(data.categoryId);
    const updated = await Product_1.ProductModel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated)
        return res.status(404).json({ message: "Product not found" });
    res.json(updated);
});
router.delete("/:id", adminAuth_1.adminAuth, async (req, res) => {
    const deleted = await Product_1.ProductModel.findByIdAndDelete(req.params.id);
    if (!deleted)
        return res.status(404).json({ message: "Product not found" });
    res.status(204).send();
});
exports.default = router;
