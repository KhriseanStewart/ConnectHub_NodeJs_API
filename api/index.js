import app from "../app.js";
import serverless from "serverless-http";
import { connectDB } from "../config/db.js";

const serverlessHandler = serverless(app);

export default async function handler(req, res) {
  try {
    await connectDB();
    return serverlessHandler(req, res);
  } catch (err) {
    console.error("[MongoDB] Handler connection error:", err.message);
    if (!res.headersSent) {
      res.status(503).json({ success: false, message: "Database unavailable", error: err.message });
    }
    return Promise.resolve();
  }
}