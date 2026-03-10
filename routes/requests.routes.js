import express from "express";
import { createConnectionRequest, getRequests, respondToRequest, deleteRequest } from "../controllers/request.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, createConnectionRequest);
router.get("/", protect, getRequests);
router.patch("/respond", protect, respondToRequest);
router.delete("/delete", protect, deleteRequest);
// router.get("/", protect, getProfile);
// router.put("/update", protect, updateConnectionRequest);
// router.delete("/delete", protect, deleteConnectionRequest);

export default router;