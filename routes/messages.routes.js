import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage, getMessagedUsers, deleteConversation, deleteAllConversations } from "../controllers/messages.controller.js";

const router = express.Router();

router.get("/:otherUserId", protect, getMessages);
router.post("/:otherUserId", protect, sendMessage);

router.get("/", protect, getMessagedUsers);
router.delete("/:otherUserId", protect, deleteConversation);
router.delete("/", protect, deleteAllConversations);


export default router;