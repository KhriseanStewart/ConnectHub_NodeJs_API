import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Notification } from "../models/notifications.js";
import { Profile } from "../models/profiles.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const toNotificationDTO = (doc) => ({
  id: String(doc._id),
  userId: String(doc.userId),
  type: doc.type,
  title: doc.title,
  body: doc.body,
  isRead: doc.isRead,
  createdAt: doc.createdAt,
  actor: {
    id: doc.actor?.id ? String(doc.actor.id) : null,
    displayName: doc.actor?.displayName ?? "",
    photoUrl: doc.actor?.photoUrl ?? "",
  },
  resource: {
    kind: doc.resource?.kind ?? "",
    id: doc.resource?.id ?? "",
  },
  deeplink: doc.deeplink ?? "",
});

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { cursor } = req.query;
  const limit = Math.min(
    Math.max(parseInt(req.query.limit ?? DEFAULT_LIMIT, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const filter = { userId };
  if (cursor) {
    if (!mongoose.Types.ObjectId.isValid(cursor)) {
      return errorResponse(res, { statusCode: 400, message: "Invalid cursor" });
    }
    filter._id = { $lt: cursor };
  }

  const notifications = await Notification.find(filter).sort({ _id: -1 }).limit(limit);
  const nextCursor =
    notifications.length === limit ? String(notifications[notifications.length - 1]._id) : null;

  return successResponse(res, {
    statusCode: 200,
    message: "Notifications fetched successfully",
    data: {
      notifications: notifications.map(toNotificationDTO),
      nextCursor,
      limit,
    },
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return successResponse(res, {
    statusCode: 200,
    message: "Unread count fetched successfully",
    data: { unreadCount },
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return errorResponse(res, { statusCode: 400, message: "Invalid notification ID" });
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    return errorResponse(res, { statusCode: 404, message: "Notification not found" });
  }

  return successResponse(res, {
    statusCode: 200,
    message: "Notification marked as read",
    data: { notification: toNotificationDTO(notification) },
  });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  return successResponse(res, {
    statusCode: 200,
    message: "All notifications marked as read",
    data: { updatedCount: result.modifiedCount ?? 0 },
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return errorResponse(res, { statusCode: 400, message: "Invalid notification ID" });
  }

  const notification = await Notification.findOneAndDelete({ _id: id, userId });
  if (!notification) {
    return errorResponse(res, { statusCode: 404, message: "Notification not found" });
  }

  return successResponse(res, {
    statusCode: 200,
    message: "Notification deleted successfully",
  });
});

export const createNotification = asyncHandler(async (req, res) => {
  // const userId = req.user.id;
  const {
    userId,
    type,
    title,
    body = "",
    actor = {},
    resource = {},
    deeplink = "",
  } = req.body ?? {};

  if (!type || !String(type).trim()) {
    return errorResponse(res, { statusCode: 400, message: "type is required" });
  }
  if (!title || !String(title).trim()) {
    return errorResponse(res, { statusCode: 400, message: "title is required" });
  }

  const notification = await Notification.create({
    userId,
    type: String(type).trim(),
    title: String(title).trim(),
    body: String(body ?? ""),
    isRead: false,
    actor: {
      id: actor?.id ?? null,
      displayName: String(actor?.displayName ?? ""),
      photoUrl: String(actor?.photoUrl ?? ""),
    },
    resource: {
      kind: String(resource?.kind ?? ""),
      id: String(resource?.id ?? ""),
    },
    deeplink: String(deeplink ?? ""),
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Notification created successfully",
    data: { notification: toNotificationDTO(notification) },
  });
});

export const createTestNotification = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return errorResponse(res, {
      statusCode: 403,
      message: "Test notifications are disabled in production",
    });
  }

  const userId = req.user.id;
  const profile = await Profile.findOne({ user: userId }).select("displayName avatarUrl");
  const actorDisplayName = profile?.displayName || req.user.name || "Unknown User";
  const actorPhotoUrl = profile?.avatarUrl || "";

  const notification = await Notification.create({
    userId,
    type: "message_received",
    title: `New message from ${actorDisplayName}`,
    body: "Hey, are you available tomorrow?",
    isRead: false,
    actor: {
      id: userId,
      displayName: actorDisplayName,
      photoUrl: actorPhotoUrl,
    },
    resource: {
      kind: "conversation",
      id: String(userId),
    },
    deeplink: `/inbox/conversation?conversationId=${userId}`,
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Test notification created successfully",
    data: { notification: toNotificationDTO(notification) },
  });
});

