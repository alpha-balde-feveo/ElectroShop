"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const adminAuth_1 = require("../middleware/adminAuth");
const Category_1 = require("../models/Category");
const slugify_1 = require("../utils/slugify");
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    const categories = await Category_1.CategoryModel.find().sort({ createdAt: -1 });
    res.json(categories);
});
router.post("/", adminAuth_1.adminAuth, async (req, res) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2)
    });
    // 🔎 DEBUG TEMPORAIRE
    console.log("HEADERS:", req.headers["content-type"]);
    console.log("BODY:", req.body);
    const { name } = schema.parse(req.body);
    const slug = (0, slugify_1.slugify)(name);
    const exists = await Category_1.CategoryModel.findOne({ slug });
    if (exists) {
        res.status(409).json({ message: "Category already exists" });
        return;
    }
    const created = await Category_1.CategoryModel.create({ name, slug });
    res.status(201).json(created);
});
router.put("/:id", adminAuth_1.adminAuth, async (req, res) => {
    const schema = zod_1.z.object({ name: zod_1.z.string().min(2) });
    const { name } = schema.parse(req.body);
    const slug = (0, slugify_1.slugify)(name);
    const updated = await Category_1.CategoryModel.findByIdAndUpdate(req.params.id, { name, slug }, { new: true });
    if (!updated)
        return res.status(404).json({ message: "Category not found" });
    res.json(updated);
});
router.delete("/:id", adminAuth_1.adminAuth, async (req, res) => {
    const deleted = await Category_1.CategoryModel.findByIdAndDelete(req.params.id);
    if (!deleted)
        return res.status(404).json({ message: "Category not found" });
    res.status(204).send();
});
exports.default = router;
