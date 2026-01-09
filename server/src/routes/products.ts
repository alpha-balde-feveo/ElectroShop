import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { adminAuth } from "../middleware/adminAuth";
import { ProductModel } from "../models/Product";

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  brand: z.string().optional().default(""),
  categoryId: z.string().min(1),

  // accepte nombre ou string convertible
  price: z.coerce.number().nonnegative(),
  oldPrice: z.coerce.number().nonnegative().optional(),

  description: z.string().optional().default(""),

  // specs libre (objet ou autre) => on accepte unknown
  specs: z.unknown().optional().default({}),

  stock: z.coerce.number().int().nonnegative(),

  images: z
    .array(z.object({ url: z.string().min(1) }))
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

  const filter: any = {};

  if (q) filter.name = { $regex: q, $options: "i" };
  if (category && mongoose.Types.ObjectId.isValid(category)) filter.categoryId = category;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (!Number.isNaN(minPrice as any) && minPrice !== undefined) filter.price.$gte = minPrice;
    if (!Number.isNaN(maxPrice as any) && maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const sortMap: Record<string, any> = {
    new: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 }
  };

  const products = await ProductModel.find(filter)
    .populate("categoryId")
    .sort(sortMap[sort] ?? sortMap.new);

  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await ProductModel.findById(req.params.id).populate("categoryId");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

router.post("/", adminAuth, async (req, res) => {
  try {
    const data = createSchema.parse(req.body);

    if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const created = await ProductModel.create({
      ...data,
      categoryId: new mongoose.Types.ObjectId(data.categoryId)
    });

    return res.status(201).json(created);
  } catch (err: any) {
    // Zod error lisible
    return res.status(400).json({
      message: "Bad Request",
      error: err?.errors ?? err?.issues ?? String(err)
    });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  const data = updateSchema.parse(req.body);

  if (data.categoryId && !mongoose.Types.ObjectId.isValid(data.categoryId)) {
    return res.status(400).json({ message: "Invalid categoryId" });
  }

  const update: any = { ...data };
  if (data.categoryId) update.categoryId = new mongoose.Types.ObjectId(data.categoryId);

  const updated = await ProductModel.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!updated) return res.status(404).json({ message: "Product not found" });

  res.json(updated);
});

router.delete("/:id", adminAuth, async (req, res) => {
  const deleted = await ProductModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Product not found" });
  res.status(204).send();
});

export default router;
