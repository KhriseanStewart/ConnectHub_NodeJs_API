import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getProfileById,
  getProfileByUserId,
  uploadAvatar,
  deleteAvatar,
  uploadPhotoUrl,
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadAvatar as uploadAvatarMiddleware, uploadProfilePhoto as uploadPhotoMiddleware } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/create", protect, createProfile);
router.get("/", protect, getProfile);
router.put("/update", protect, updateProfile);
router.delete("/delete", protect, deleteProfile);

router.put("/avatar", protect, uploadAvatarMiddleware, uploadAvatar);
router.delete("/avatar", protect, deleteAvatar);

router.post("/photos", protect, uploadPhotoMiddleware, uploadPhotoUrl);

router.get("/user/:userId", protect, getProfileByUserId);

router.get("/:id", protect, getProfileById);

export default router;