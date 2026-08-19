import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { seedAdmin } from "./seed/seedAdmin";
import categoryRoutes from "./routes/categories";
import { seedCategories } from "./seed/seedCategories";
import productRoutes from "./routes/products";
import path from "path";
import uploadRoutes from "./routes/upload";
import promoRoutes from "./routes/promo";
import orderRoutes from "./routes/orders";
import adminStatsRoutes from "./routes/adminStats";





dotenv.config();

import { connectDB } from "./config/db";


const app = express();

// Render (et Vercel) sont derrière un reverse proxy : nécessaire pour que
// express-rate-limit et req.ip lisent la vraie IP du client via X-Forwarded-For.
app.set("trust proxy", 1);

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/upload", uploadRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/stats", adminStatsRoutes);





app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "electroshop-api" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function bootstrap() {
  await connectDB();
  await seedAdmin();
  await seedCategories();

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

// 404 JSON
app.use((req, res) => {
  res.status(404).json({ message: "Not Found", path: req.path });
});

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err?.issues) {
    return res.status(400).json({ message: "Validation error", issues: err.issues });
  }
  res.status(500).json({ message: err?.message ?? "Server error" });
});
