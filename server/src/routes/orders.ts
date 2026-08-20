import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import rateLimit from "express-rate-limit";
import { adminAuth } from "../middleware/adminAuth";
import { OrderModel } from "../models/Order";
import { ProductModel } from "../models/Product";
import { PromoCodeModel } from "../models/PromoCode";

const router = Router();

/** Numéro sénégalais : 9 chiffres commençant par 7, indicatif 221 optionnel. */
function isValidSenegalPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("221") ? digits.slice(3) : digits;
  return /^7\d{8}$/.test(local);
}

function localPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("221") ? digits.slice(3) : digits;
}

/** Code de retrait à 6 chiffres, non-devinable, vérifié par le staff en boutique. */
function generatePickupCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 20 recherches / 15 min par IP — évite l'énumération automatisée de commandes.
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de tentatives, réessayez dans quelques minutes." }
});

const createOrderSchema = z
  .object({
    customerName: z.string().min(2),
    phone: z
      .string()
      .refine(isValidSenegalPhone, {
        message: "Numéro de téléphone invalide (9 chiffres, ex : 77 123 45 67)"
      }),
    address: z.string().optional().default(""),
    city: z.string().optional().default(""),
    notes: z.string().optional().default(""),

    shipping: z
      .enum(["STANDARD", "EXPRESS", "PICKUP"])
      .optional()
      .default("STANDARD"),
    paymentMethod: z
      .enum(["ON_DELIVERY", "WAVE", "CASH_ON_SITE"])
      .optional()
      .default("ON_DELIVERY"),
    promoCode: z.string().optional().default(""),

    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          qty: z.coerce.number().int().min(1),
          variant: z.string().optional().default("")
        })
      )
      .min(1)
  })
  .superRefine((data, ctx) => {
    // L'adresse n'est requise que pour une livraison
    if (data.shipping !== "PICKUP") {
      if (data.address.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: "Adresse requise pour la livraison"
        });
      }
      if (data.city.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["city"],
          message: "Ville requise pour la livraison"
        });
      }
    }
    // Wave / espèces sur place uniquement pour le retrait en boutique
    if (data.shipping === "PICKUP" && data.paymentMethod === "ON_DELIVERY") {
      ctx.addIssue({
        code: "custom",
        path: ["paymentMethod"],
        message: "Choisissez Wave ou espèces pour un retrait en boutique"
      });
    }
  });

const SHIPPING_FEES: Record<string, number> = {
  STANDARD: 1500,
  EXPRESS: 3000,
  PICKUP: 0
};

// PUBLIC - create order
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createOrderSchema.parse(req.body);

    const shippingFee = SHIPPING_FEES[data.shipping] ?? 1500;

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
        nameSnapshot:
          product.name + (item.variant ? ` — ${item.variant}` : ""),
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

    // Décrément atomique du stock, article par article : la condition
    // stock >= qty est vérifiée par MongoDB au moment même du $inc, ce qui
    // évite la survente si deux commandes concurrentes visent le dernier
    // exemplaire (contrairement à un simple check puis update séparés).
    const decremented: { productId: mongoose.Types.ObjectId; qty: number }[] = [];

    async function rollbackStock() {
      for (const d of decremented) {
        await ProductModel.findByIdAndUpdate(d.productId, { $inc: { stock: d.qty } });
      }
    }

    for (const s of snapshots) {
      const updated = await ProductModel.findOneAndUpdate(
        { _id: s.productId, stock: { $gte: s.qty } },
        { $inc: { stock: -s.qty } }
      );

      if (!updated) {
        await rollbackStock();
        res
          .status(409)
          .json({ message: `Stock épuisé entre-temps pour ${s.nameSnapshot}` });
        return;
      }

      decremented.push({ productId: s.productId, qty: s.qty });
    }

    try {
      const order = await OrderModel.create({
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        notes: data.notes,
        items: snapshots,
        shippingMode: data.shipping,
        paymentMethod: data.paymentMethod,
        promoCode,
        subtotal,
        discount,
        shippingFee,
        total,
        status: "PENDING",
        pickupCode: data.shipping === "PICKUP" ? generatePickupCode() : undefined
      });

      res.status(201).json(order);
    } catch (err) {
      // La commande n'a pas pu être créée : on restitue le stock décrémenté.
      await rollbackStock();
      throw err;
    }
  })
);

// PUBLIC - retrouver sa commande (référence courte + téléphone)
router.post(
  "/lookup",
  lookupLimiter,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      reference: z.string().min(4),
      phone: z.string().min(4)
    });
    const { reference, phone } = schema.parse(req.body);

    const ref = reference.replace(/\s/g, "").toUpperCase();
    const phoneLocal = localPhoneDigits(phone);

    // La référence courte = les 8 derniers caractères de l'_id Mongo
    // (celle affichée sur la confirmation / la facture WhatsApp).
    const candidates = await OrderModel.aggregate([
      { $addFields: { idStr: { $toUpper: { $toString: "$_id" } } } },
      { $match: { idStr: { $regex: `${ref}$` } } }
    ]);

    const match = candidates.find(
      (o) => localPhoneDigits(String(o.phone)) === phoneLocal
    );

    if (!match) {
      res.status(404).json({
        message: "Commande introuvable. Vérifiez le numéro de commande et le téléphone."
      });
      return;
    }

    const order = await OrderModel.findById(match._id);
    res.json(order);
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
