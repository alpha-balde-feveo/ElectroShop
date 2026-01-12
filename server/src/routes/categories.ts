import { Router } from "express";
import { z } from "zod";
import { adminAuth } from "../middleware/adminAuth";
import { CategoryModel } from "../models/Category";
import { slugify } from "../utils/slugify";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await CategoryModel.find().sort({ createdAt: -1 });
  res.json(categories);
});

router.post("/", adminAuth, async (req, res) => {
  const schema = z.object({
    name: z.string().min(2)
  });

  // 🔎 DEBUG TEMPORAIRE
  console.log("HEADERS:", req.headers["content-type"]);
  console.log("BODY:", req.body);

  const { name } = schema.parse(req.body);

  const slug = slugify(name);
  const exists = await CategoryModel.findOne({ slug });
  if (exists) {
    res.status(409).json({ message: "Category already exists" });
    return;
  }

  const created = await CategoryModel.create({ name, slug });
  res.status(201).json(created);
});

router.put("/:id", adminAuth, async (req, res) => {
  const schema = z.object({ name: z.string().min(2) });
  const { name } = schema.parse(req.body);

  const slug = slugify(name);

  const updated = await CategoryModel.findByIdAndUpdate(
    req.params.id,
    { name, slug },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Category not found" });
  res.json(updated);
});

router.delete("/:id", adminAuth, async (req, res) => {
  const deleted = await CategoryModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Category not found" });
  res.status(204).send();
});

export default router;
