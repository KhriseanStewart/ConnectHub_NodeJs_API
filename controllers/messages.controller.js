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

export const getMessages = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const currentUserId = req.user.id;

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

const getMessages = async (req, res) => {
    const { otherUserId } = req.params;
    const { user } = req;
    const messages = await Message.find({
        $or: [{ fromUser: user._id, toUser: otherUserId }, { fromUser: otherUserId, toUser: user._id }],
    });
    res.status(200).json(messages);
};

const sendMessage = async (req, res) => {
    const { otherUserId } = req.params;
    const { user } = req;
    const { text } = req.body;
    const message = await Message.create({
        fromUser: user._id,
        toUser: otherUserId,
        message,
    });
    res.status(201).json(message);
};

const getMessagedUsers = async (req, res) => {
    const { user } = req;
    const messagedUsers = await Message.find({ $or: [{ fromUser: user._id }, { toUser: user._id }] }).distinct("toUser");
    res.status(200).json(messagedUsers);
};

const deleteConversation = async (req, res) => {
    const { otherUserId } = req.params;
    const { user } = req;
    await Message.deleteMany({ $or: [{ fromUser: user._id, toUser: otherUserId }, { fromUser: otherUserId, toUser: user._id }] });
    res.status(200).json({ message: "Conversation deleted successfully" });
};

const deleteAllConversations = async (req, res) => {
    const { user } = req;
    await Message.deleteMany({ $or: [{ fromUser: user._id }, { toUser: user._id }] });
    res.status(200).json({ message: "All conversations deleted successfully" });
};

export { getMessages, sendMessage, getMessagedUsers, deleteConversation, deleteAllConversations };