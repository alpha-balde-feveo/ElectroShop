import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in environment variables");
  return uri;
}

export async function connectDB(retries = 10, delayMs = 1500) {
  const MONGO_URI = getMongoUri();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
      return;
    } catch (err) {
      console.error(`❌ MongoDB connect attempt ${attempt}/${retries} failed`);
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}
