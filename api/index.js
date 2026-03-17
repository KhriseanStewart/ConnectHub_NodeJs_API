import app from "../app.js";
import serverless from "serverless-http";
import { connectDB } from "../config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    const handler = serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error("[MongoDB] Handler connection error:", err.message);
    res.status(503).json({ success: false, message: "Database unavailable", error: err.message });
  }
}