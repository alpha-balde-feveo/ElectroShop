"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const seedAdmin_1 = require("./seed/seedAdmin");
const categories_1 = __importDefault(require("./routes/categories"));
const seedCategories_1 = require("./seed/seedCategories");
const products_1 = __importDefault(require("./routes/products"));
const path_1 = __importDefault(require("path"));
const upload_1 = __importDefault(require("./routes/upload"));
const promo_1 = __importDefault(require("./routes/promo"));
const orders_1 = __importDefault(require("./routes/orders"));
const adminStats_1 = __importDefault(require("./routes/adminStats"));
dotenv_1.default.config();
const db_1 = require("./config/db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/products", products_1.default);
app.use("/uploads", express_1.default.static(path_1.default.resolve("uploads")));
app.use("/api/upload", upload_1.default);
app.use("/api/promo", promo_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/admin/stats", adminStats_1.default);
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "electroshop-api" });
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
async function bootstrap() {
    await (0, db_1.connectDB)();
    await (0, seedAdmin_1.seedAdmin)();
    await (0, seedCategories_1.seedCategories)();
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
app.use((err, _req, res, _next) => {
    if (err?.issues) {
        return res.status(400).json({ message: "Validation error", issues: err.issues });
    }
    res.status(500).json({ message: err?.message ?? "Server error" });
});
