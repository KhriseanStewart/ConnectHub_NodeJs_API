import express from "express";
import { getConnections, deleteConnection } from "../controllers/connections.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/", protect, getConnections);
router.delete("/delete", protect, deleteConnection);

export default router;