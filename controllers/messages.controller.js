import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Message } from "../models/messages.js";
import { Connection } from "../models/requests.js";

const buildPairKey = (userIdA, userIdB) => {
  return [String(userIdA), String(userIdB)].sort().join("_");
};

const ensureConnected = async (currentUserId, otherUserId) => {
  const pairKey = buildPairKey(currentUserId, otherUserId);
  const connection = await Connection.findOne({ pairKey });
  return { connection, pairKey };
};

const isValidUserId = (id) => id && mongoose.Types.ObjectId.isValid(id);

export const getMessages = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const currentUserId = req.user.id;
  if (!isValidUserId(otherUserId)) {
    return errorResponse(res, { statusCode: 400, message: "Invalid user ID" });
  }
  if (String(otherUserId) === String(currentUserId)) {
    return errorResponse(res, { statusCode: 400, message: "Cannot get messages with yourself" });
  }

  const { connection, pairKey } = await ensureConnected(currentUserId, otherUserId);
  if (!connection) {
    return errorResponse(res, { statusCode: 403, message: "You are not connected with this user" });
  }

  const messages = await Message.find({ pairKey }).sort({ createdAt: 1 });

  return successResponse(res, {
    statusCode: 200,
    message: "Messages fetched successfully",
    data: { messages },
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const currentUserId = req.user.id;
  if (!isValidUserId(otherUserId)) {
    return errorResponse(res, { statusCode: 400, message: "Invalid user ID" });
  }
  if (String(otherUserId) === String(currentUserId)) {
    return errorResponse(res, { statusCode: 400, message: "Cannot message yourself" });
  }
  const { text, mediaUrl } = req.body;

  if (!text && !mediaUrl) {
    return errorResponse(res, { statusCode: 400, message: "Message text or mediaUrl is required" });
  }

  const { connection, pairKey } = await ensureConnected(currentUserId, otherUserId);
  if (!connection) {
    return errorResponse(res, { statusCode: 403, message: "You are not connected with this user" });
  }

  const message = await Message.create({
    fromUser: currentUserId,
    toUser: otherUserId,
    pairKey,
    text: text ?? "",
    mediaUrl: mediaUrl ?? "",
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Message sent successfully",
    data: { message },
  });
});

export const getMessagedUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  const connections = await Connection.find({
    $or: [{ userA: currentUserId }, { userB: currentUserId }],
  }).select("userA userB -_id");

  const userIds = new Set();
  for (const conn of connections) {
    const a = String(conn.userA);
    const b = String(conn.userB);
    if (a !== String(currentUserId)) userIds.add(a);
    if (b !== String(currentUserId)) userIds.add(b);
  }

  return successResponse(res, {
    statusCode: 200,
    message: "Messaged/connected users fetched successfully",
    data: { userIds: Array.from(userIds) },
  });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const currentUserId = req.user.id;
  if (!isValidUserId(otherUserId)) {
    return errorResponse(res, { statusCode: 400, message: "Invalid user ID" });
  }

  const { connection, pairKey } = await ensureConnected(currentUserId, otherUserId);
  if (!connection) {
    return errorResponse(res, { statusCode: 403, message: "You are not connected with this user" });
  }

  await Message.deleteMany({ pairKey });

  return successResponse(res, {
    statusCode: 200,
    message: "Conversation deleted successfully",
  });
});

export const deleteAllConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  const connections = await Connection.find({
    $or: [{ userA: currentUserId }, { userB: currentUserId }],
  }).select("userA userB -_id");

  if (!connections.length) {
    return successResponse(res, {
      statusCode: 200,
      message: "No conversations to delete",
    });
  }

  const pairKeys = connections.map((conn) =>
    buildPairKey(conn.userA, conn.userB)
  );

  await Message.deleteMany({ pairKey: { $in: pairKeys } });

  return successResponse(res, {
    statusCode: 200,
    message: "All conversations deleted successfully",
  });
});