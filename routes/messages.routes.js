import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage, getMessagedUsers, deleteConversation, deleteAllConversations, uploadMessagePhoto } from "../controllers/messages.controller.js";
import { uploadProfilePhoto as uploadPhotoMiddleware } from "../middleware/upload.middleware.js";
import { errorResponse } from "../utils/response.js";

const router = express.Router();

const handleUploadError = (err, req, res, next) => {
  if (err) {
    return errorResponse(res, { statusCode: 400, message: err.message || "Upload failed" });
  }
  next();
};

router.get("/", protect, getMessagedUsers);
router.delete("/", protect, deleteAllConversations);
router.get("/:otherUserId", protect, getMessages);
router.post("/:otherUserId/photo", protect, uploadPhotoMiddleware, handleUploadError, uploadMessagePhoto);
router.post("/:otherUserId", protect, sendMessage);
router.delete("/:otherUserId", protect, deleteConversation);

export default router;