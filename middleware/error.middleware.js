import { errorResponse } from "../utils/response.js";

/**
 * Central error handler. Must be registered last (after all routes).
 * Sends appropriate status and message for known error types.
 */
export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode ?? err.status ?? 500;
  const message = err.message ?? "Something went wrong";

  if (err.name === "ValidationError") {
    const errors = Object.entries(err.errors || {}).reduce((acc, [k, v]) => {
      acc[k] = v?.message ?? v;
      return acc;
    }, {});
    return errorResponse(res, { statusCode: 400, message: "Validation failed", error: errors });
  }

  if (err.name === "CastError") {
    return errorResponse(res, { statusCode: 400, message: "Invalid ID or data", error: err.path });
  }

  if (err.code === 11000) {
    return errorResponse(res, { statusCode: 409, message: "Duplicate value", error: err.keyValue });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return errorResponse(res, { statusCode: 401, message: message });
  }

  return errorResponse(res, { statusCode: Number(statusCode) || 500, message });
}
