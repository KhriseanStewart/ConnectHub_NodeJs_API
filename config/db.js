import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("[MongoDB] MONGODB_URI is not defined in environment variables");
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("[MongoDB] Connection error:", err.message);
    if (err.name) console.error("[MongoDB] Error name:", err.name);
    if (err.code) console.error("[MongoDB] Error code:", err.code);
    throw err;
  }
}
