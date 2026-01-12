import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import { OrderModel } from "../models/Order";
import { ProductModel } from "../models/Product";

const router = Router();

router.get("/", adminAuth, async (_req, res) => {
  const ordersCount = await OrderModel.countDocuments();

  const revenueAgg = await OrderModel.aggregate([
    { $match: { status: { $ne: "CANCELED" } } },
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]);

  const lowStock = await ProductModel.countDocuments({ stock: { $lte: 3 } });

  res.json({
    ordersCount,
    revenue: revenueAgg[0]?.total ?? 0,
    lowStock
  });
});

export default router;
