import mongoose from "mongoose";
import { getDb } from "./store.js";
export async function initDatabase() {
  getDb();
  console.log("\u2713 Nivora Market Data Store initialized");
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes("username:password")) {
    console.log("\u2139 MONGODB_URI not configured or using template placeholder. Running in persistent embedded storage mode.");
    return { isMongooseConnected: false };
  }
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return { isMongooseConnected: true };
  }
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5e3
    });
    console.log("\u2713 Connected to MongoDB Atlas successfully.");
    return { isMongooseConnected: true };
  } catch (err) {
    console.warn("\u26A0\uFE0F Warning: MongoDB Atlas connection failed (" + err.message + "). Seamlessly using high-performance local store.");
    return { isMongooseConnected: false };
  }
}
