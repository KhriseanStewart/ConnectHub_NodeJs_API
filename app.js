import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import profilesRoutes from "./routes/profiles.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Welcome to the ConnectHub API");
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profilesRoutes);

app.use(errorMiddleware);

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    });

export default app;