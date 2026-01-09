import { CategoryModel } from "../models/Category";
import { slugify } from "../utils/slugify";

const DEFAULT_CATEGORIES = [
  "Informatique",
  "Smartphones",
  "Accessoires",
  "Réseau",
  "Gaming"
];

export async function seedCategories() {
  for (const name of DEFAULT_CATEGORIES) {
    const slug = slugify(name);

    const exists = await CategoryModel.findOne({ slug });
    if (exists) continue;

    await CategoryModel.create({ name, slug });
    console.log("✅ Seed category:", name);
  }
}
