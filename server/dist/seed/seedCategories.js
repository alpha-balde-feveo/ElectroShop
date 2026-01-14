"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCategories = seedCategories;
const Category_1 = require("../models/Category");
const slugify_1 = require("../utils/slugify");
const DEFAULT_CATEGORIES = [
    "Informatique",
    "Smartphones",
    "Accessoires",
    "Réseau",
    "Gaming"
];
async function seedCategories() {
    for (const name of DEFAULT_CATEGORIES) {
        const slug = (0, slugify_1.slugify)(name);
        const exists = await Category_1.CategoryModel.findOne({ slug });
        if (exists)
            continue;
        await Category_1.CategoryModel.create({ name, slug });
        console.log("✅ Seed category:", name);
    }
}
