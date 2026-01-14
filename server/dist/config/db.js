"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
function getMongoUri() {
    const uri = process.env.MONGO_URI;
    if (!uri)
        throw new Error("Missing MONGO_URI in environment variables");
    return uri;
}
async function connectDB(retries = 10, delayMs = 1500) {
    const MONGO_URI = getMongoUri();
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose_1.default.connect(MONGO_URI);
            console.log("✅ MongoDB connected");
            return;
        }
        catch (err) {
            console.error(`❌ MongoDB connect attempt ${attempt}/${retries} failed`);
            if (attempt === retries)
                throw err;
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
}
