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
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadAvatar as uploadAvatarMiddleware } from "../middleware/upload.middleware.js";
import { errorResponse } from "../utils/response.js";

const router = express.Router();

const handleUploadError = (err, req, res, next) => {
  if (err) {
    return errorResponse(res, { statusCode: 400, message: err.message || "Upload failed" });
  }
  next();
};

router.post("/create", protect, createProfile);
router.get("/", protect, getProfile);
router.put("/update", protect, updateProfile);
router.delete("/delete", protect, deleteProfile);

router.put("/avatar", protect, uploadAvatarMiddleware, handleUploadError, uploadAvatar);
router.delete("/avatar", protect, deleteAvatar);

router.get("/user/:userId", protect, getProfileByUserId);

router.get("/:id", protect, getProfileById);

export default router;