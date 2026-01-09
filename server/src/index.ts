import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { seedAdmin } from "./seed/seedAdmin";
import categoryRoutes from "./routes/categories";
import { seedCategories } from "./seed/seedCategories";
import productRoutes from "./routes/products";
import path from "path";
import uploadRoutes from "./routes/upload";
import promoRoutes from "./routes/promo";




dotenv.config();

import { connectDB } from "./config/db";


const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/upload", uploadRoutes);
app.use("/api/promo", promoRoutes);




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
