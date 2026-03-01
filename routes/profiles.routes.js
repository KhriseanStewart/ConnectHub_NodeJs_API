import express from "express";
import { createProfile, getProfile, updateProfile, deleteProfile } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, createProfile);
router.get("/get", protect, getProfile);
router.put("/update", protect, updateProfile);
router.delete("/delete", protect, deleteProfile);

export default router;