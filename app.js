import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import profilesRoutes from "./routes/profiles.routes.js";
import browseRoutes from "./routes/browse.routes.js";
import requestsRoutes from "./routes/requests.routes.js";
import connectionsRoutes from "./routes/connection.routes.js";


dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Welcome to the ConnectHub API");
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/browse", browseRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/connections", connectionsRoutes);

app.use(errorMiddleware);

// Only start listening when running as a standalone server (not on Vercel serverless)
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("[MongoDB] Failed to connect:", err.message);
      if (err.code) console.error("[MongoDB] Code:", err.code);
      process.exit(1);
    });
}

export default app;