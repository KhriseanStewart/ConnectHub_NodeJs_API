import { asyncHandler } from "../utils/asyncHandler.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { User } from "../models/users.js";
import { PasswordResetToken } from "../models/passwordResetToken.js";
import { generateNumericOtp, hashOtp, OTP_LENGTH, OTP_EXPIRES_MINUTES } from "../utils/otp.js";
import jwt from "jsonwebtoken";
import { Email } from "../config/email.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, { statusCode: 400, message: "Name, email and password are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, { statusCode: 400, message: "User already exists" });
  }

  const user = await User.create({ name, email, password });
  return successResponse(res, { statusCode: 201, message: "User created successfully", data: { user } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, { statusCode: 400, message: "Email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return errorResponse(res, { statusCode: 400, message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, { statusCode: 400, message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return successResponse(res, { statusCode: 200, message: "Login successful", data: { user, token } });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return errorResponse(res, { statusCode: 404, message: "User not found" });
  }
  return successResponse(res, { statusCode: 200, message: "User fetched successfully", data: { user } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, { statusCode: 400, message: "Email is required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return successResponse(res, {
      statusCode: 200,
      message: "If that email exists, an OTP was sent",
      data: null,
    });
  }

  const otp = generateNumericOtp(OTP_LENGTH);
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await PasswordResetToken.deleteMany({ user: user._id });
  await PasswordResetToken.create({ user: user._id, tokenHash: otpHash, expiresAt });

  const mail = new Email({
    email: user.email,
    full_name: user.name,
    resetCode: otp,
    subject: "Reset your password (OTP)",
  });
  await mail.sendPasswordReset();

  return successResponse(res, {
    statusCode: 200,
    message: "If that email exists, an OTP was sent",
    data: null,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return errorResponse(res, {
      statusCode: 400,
      message: "Email, OTP and new password are required",
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return errorResponse(res, { statusCode: 400, message: "Invalid or expired OTP" });
  }

  const resetRecord = await PasswordResetToken.findOne({
    user: user._id,
    expiresAt: { $gt: new Date() },
  });
  if (!resetRecord) {
    return errorResponse(res, { statusCode: 400, message: "Invalid or expired OTP" });
  }

  const otpHash = hashOtp(String(otp).trim());
  if (otpHash !== resetRecord.tokenHash) {
    return errorResponse(res, { statusCode: 400, message: "Invalid or expired OTP" });
  }

  user.password = newPassword;
  await user.save();
  await PasswordResetToken.deleteMany({ user: user._id });

  const mail = new Email({
    email: user.email,
    full_name: user.name,
    subject: "Your password has been changed",
    resetCode: null,
  });
  await mail.sendPasswordChangeEmail();

  return successResponse(res, {
    statusCode: 200,
    message: "Password was reset successfully",
    data: null,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return errorResponse(res, { statusCode: 404, message: "User not found" });
  }
  return successResponse(res, { statusCode: 200, message: "Logout successful" });
});