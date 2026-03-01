import jwt from "jsonwebtoken";
import { User } from "../models/users.js";
import { errorResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return errorResponse(res, { statusCode: 401, message: "Not authorized" });
    }

    if (!JWT_SECRET) {
      return errorResponse(res, { statusCode: 500, message: "Server auth not configured" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, { statusCode: 401, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return errorResponse(res, { statusCode: 401, message: "Invalid or expired token" });
    }
    next(err);
  }
}
