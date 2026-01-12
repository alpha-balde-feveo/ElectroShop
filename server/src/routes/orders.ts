import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { adminAuth } from "../middleware/adminAuth";
import { OrderModel } from "../models/Order";
import { ProductModel } from "../models/Product";
import { PromoCodeModel } from "../models/PromoCode";

const router = Router();

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().min(3),
  city: z.string().min(2),
  notes: z.string().optional().default(""),

  shipping: z.enum(["STANDARD", "EXPRESS"]).optional().default("STANDARD"),
  promoCode: z.string().optional().default(""),

  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.coerce.number().int().min(1)
      })
    )
    .min(1)
});

// PUBLIC - create order
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createOrderSchema.parse(req.body);

    const shippingFee = data.shipping === "EXPRESS" ? 3000 : 1500;

    const snapshots: any[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        res.status(400).json({ message: "Invalid productId" });
        return;
      }

      const product = await ProductModel.findById(item.productId);
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
      const promo = await PromoCodeModel.findOne({ code: promoCode, active: true });
      if (!promo) {
        res.status(400).json({ message: "Invalid promo code" });
        return;
      }

      if (promo.expiry && promo.expiry.getTime() < Date.now()) {
        res.status(400).json({ message: "Promo code expired" });
        return;
      }

      if (promo.type === "PERCENT") discount = Math.round((subtotal * promo.value) / 100);
      else discount = promo.value;

      if (discount > subtotal) discount = subtotal;
    }

    const total = subtotal - discount + shippingFee;

    // Stock decrement (simple)
    for (const s of snapshots) {
      await ProductModel.findByIdAndUpdate(s.productId, { $inc: { stock: -s.qty } });
    }

    const order = await OrderModel.create({
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
  })
);

// ADMIN - list orders
router.get(
  "/",
  adminAuth,
  asyncHandler(async (_req, res) => {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    res.json(orders);
  })
);

// ADMIN - order detail
router.get(
  "/:id",
  adminAuth,
  asyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(order);
  })
);

// ADMIN - update status
router.put(
  "/:id/status",
  adminAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELED"])
    });

    const { status } = schema.parse(req.body);

    const updated = await OrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json(updated);
  })
);

export default router;
