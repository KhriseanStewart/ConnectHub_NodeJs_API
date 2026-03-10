import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Connection } from "../models/requests.js";

export const getConnections = asyncHandler(async (req, res) => {
  const connections = await Connection.find({ $or: [{ userA: req.user.id }, { userB: req.user.id }] });
  return successResponse(res, { statusCode: 200, message: "Connections fetched successfully", data: { connections } });
});

export const deleteConnection = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const connection = await Connection.findByIdAndDelete(id);
  return successResponse(res, { statusCode: 200, message: "Connection deleted successfully", data: { connection } });
});