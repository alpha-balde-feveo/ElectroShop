import { Router } from "express";
import { z } from "zod";
import asyncHandler from "express-async-handler";
import { adminAuth } from "../middleware/adminAuth";
import { PromoCodeModel } from "../models/PromoCode";

const router = Router();

const createSchema = z.object({
  code: z.string().min(2).transform((s) => s.toUpperCase().trim()),
  type: z.string().transform((s) => s.toUpperCase()).pipe(z.enum(["PERCENT", "FIXED"])),
  value: z.coerce.number().nonnegative(),
  active: z.coerce.boolean().optional().default(true),
  expiry: z.coerce.date().optional()
});

// PUBLIC - validate
router.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      code: z.string().min(2).transform((s) => s.toUpperCase().trim())
    });

    const { code } = schema.parse(req.body);

    const promo = await PromoCodeModel.findOne({ code, active: true });
    if (!promo) {
      res.status(404).json({ message: "Invalid promo code" });
      return;
    }

    if (promo.expiry && promo.expiry.getTime() < Date.now()) {
      res.status(400).json({ message: "Promo code expired" });
      return;
    }

    res.json({ code: promo.code, type: promo.type, value: promo.value });
  })
);

// ADMIN - list
router.get(
  "/",
  adminAuth,
  asyncHandler(async (_req, res) => {
    const promos = await PromoCodeModel.find().sort({ createdAt: -1 });
    res.json(promos);
  })
);

// ADMIN - create
router.post(
  "/",
  adminAuth,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);

    const existing = await PromoCodeModel.findOne({ code: data.code });
    if (existing) {
      res.status(409).json({ message: "Promo code already exists" });
      return;
    }

    const created = await PromoCodeModel.create(data);
    res.status(201).json(created);
  })
);

// ADMIN - update
router.put(
  "/:id",
  adminAuth,
  asyncHandler(async (req, res) => {
    const data = createSchema.partial().parse(req.body);

    const updated = await PromoCodeModel.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Promo not found" });
      return;
    }

    res.json(updated);
  })
);

// ADMIN - delete
router.delete(
  "/:id",
  adminAuth,
  asyncHandler(async (req, res) => {
    const deleted = await PromoCodeModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Promo not found" });
      return;
    }

    res.status(204).send();
  })
);

export default router;
