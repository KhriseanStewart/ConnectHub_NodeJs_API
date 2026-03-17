import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage, getMessagedUsers, deleteConversation, deleteAllConversations } from "../controllers/messages.controller.js";

const router = express.Router();

router.get("/", protect, getMessagedUsers);
router.delete("/", protect, deleteAllConversations);
router.get("/:otherUserId", protect, getMessages);
router.post("/:otherUserId", protect, sendMessage);
router.delete("/:otherUserId", protect, deleteConversation);

export default router;