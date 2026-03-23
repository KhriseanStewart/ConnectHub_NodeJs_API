import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  createNotification,
  createTestNotification,
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/", protect, createNotification);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteNotification);
router.post("/test", protect, createTestNotification);

export default router;

