import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Connection, ConnectionRequest } from "../models/requests.js";

export const createConnectionRequest = asyncHandler(async (req, res) => {
  const { toUserId } = req.body;
  if (!toUserId) {
    return errorResponse(res, { statusCode: 400, message: "toUserId is required" });
  }
  if (String(toUserId) === String(req.user.id)) {
    return errorResponse(res, { statusCode: 400, message: "You cannot send a request to yourself" });
  }

  const pairKey = [String(req.user.id), String(toUserId)].sort().join("_");

  const existingRequest = await ConnectionRequest.findOne({ pairKey, status: "pending" });
  if (existingRequest) {
    return errorResponse(res, { statusCode: 409, message: "Request already pending" });
  }

  const existingConnection = await ConnectionRequest.findOne({ pairKey });
  if (existingConnection) {
    return errorResponse(res, { statusCode: 409, message: "Already connected" });
  }

  const connectionRequest = await ConnectionRequest.create({
    fromUser: req.user.id,
    toUser: toUserId,
    pairKey,
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Request created successfully",
    data: { connectionRequest },
  });
});

const VALID_TYPES = ["incoming", "outgoing"];
const VALID_STATUSES = ["pending", "accepted", "declined"];

export const getRequests = asyncHandler(async (req, res) => {
  const { type, status } = req.query;

  const filter = {};
  if (type) {
    if (!VALID_TYPES.includes(type)) {
      return errorResponse(res, { statusCode: 400, message: "type must be incoming or outgoing" });
    }
    if (type === "incoming") filter.toUser = req.user.id;
    if (type === "outgoing") filter.fromUser = req.user.id;
  } else {
    filter.$or = [
      { toUser: req.user.id },
      { fromUser: req.user.id },
    ];
  }
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return errorResponse(res, { statusCode: 400, message: "status must be pending, accepted, or declined" });
    }
    filter.status = status;
  }

  const requests = await ConnectionRequest.find(filter).sort({ createdAt: -1 });
  return successResponse(res, { statusCode: 200, message: "Requests fetched successfully", data: { requests } });
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const { id, action } = req.body;
  const request = await ConnectionRequest.findByIdAndUpdate(id, { status: action, respondedAt: new Date() }, { new: true });
  if (!request) {
    return errorResponse(res, { statusCode: 404, message: "Request not found" });
  }
  if(action === "accept") {
    const connection = await Connection.create({
      userA: request.fromUser,
      userB: request.toUser,
      pairKey: request.pairKey,
    });
    if (!connection) {
      return errorResponse(res, { statusCode: 500, message: "Failed to create connection" });
    }
  }
  return successResponse(res, { statusCode: 200, message: "Request responded successfully", data: { request } });
});

export const deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const request = await ConnectionRequest.findByIdAndDelete(id);
  if (!request) {
    return errorResponse(res, { statusCode: 404, message: "Request not found" });
  }
  return successResponse(res, { statusCode: 200, message: "Request deleted successfully", data: { request } });
});