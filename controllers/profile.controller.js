import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Profile } from "../models/profiles.js";
import { r2Client, bucketName, publicBaseUrl, isConfigured } from "../config/r2.js";

export const createProfile = asyncHandler(async (req, res, next) => {
  try {
    const { displayName, bio, location, interests, photoUrls, occupation } = req.body;
    if (!displayName || !bio || !location || !interests || !photoUrls || !occupation) {
      return errorResponse(res, { statusCode: 400, message: "All fields are required" });
    }
    const user = req.user.id;
    const profile = await Profile.create({
      displayName,
      bio,
      location,
      interests,
      photoUrls,
      occupation,
      user,
    });
    return successResponse(res, { statusCode: 201, message: "Profile created successfully", data: { profile } });
  } catch (err) {
    next(err);
  }
});

export const getProfile = asyncHandler(async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return errorResponse(res, { statusCode: 404, message: "Profile not found" });
    }
    return successResponse(res, { statusCode: 200, message: "Profile fetched successfully", data: { profile } });
  } catch (err) {
    next(err);
  }
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  try {
    const { displayName, bio, location, interests, photoUrls, occupation } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { displayName, bio, location, interests, photoUrls, occupation },
      { new: true }
    );
    if (!profile) {
      return errorResponse(res, { statusCode: 404, message: "Profile not found" });
    }
    return successResponse(res, { statusCode: 200, message: "Profile updated successfully", data: { profile } });
  } catch (err) {
    next(err);
  }
});

export const deleteProfile = asyncHandler(async (req, res, next) => {
  try {
    const result = await Profile.findOneAndDelete({ user: req.user.id });
    if (!result) {
      return errorResponse(res, { statusCode: 404, message: "Profile not found" });
    }
    return successResponse(res, { statusCode: 200, message: "Profile deleted successfully" });
  } catch (err) {
    next(err);
  }
});


export const getProfileById = asyncHandler(async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return errorResponse(res, { statusCode: 404, message: "Profile not found" });
    }
    return successResponse(res, { statusCode: 200, message: "Profile fetched successfully", data: { profile } });
  } catch (err) {
    next(err);
  }
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!isConfigured || !r2Client || !publicBaseUrl) {
    return errorResponse(res, { statusCode: 503, message: "Avatar upload is not configured" });
  }
  if (!req.file) {
    return errorResponse(res, { statusCode: 400, message: "No file uploaded. Use field 'avatar' with an image (JPEG, PNG, WebP, GIF)" });
  }
  let profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return errorResponse(res, { statusCode: 404, message: "Profile not found. Create a profile first." });
  }
  const key = `avatars/${req.user.id}`;
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    })
  );
  const avatarUrl = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  profile.avatarUrl = avatarUrl;
  await profile.save();
  return successResponse(res, { statusCode: 200, message: "Avatar uploaded successfully", data: { profile } });
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return errorResponse(res, { statusCode: 404, message: "Profile not found" });
  }
  if (!profile.avatarUrl) {
    return successResponse(res, { statusCode: 200, message: "No avatar to delete", data: { profile } });
  }
  if (r2Client && isConfigured) {
    const key = `avatars/${req.user.id}`;
    await r2Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })).catch(() => {});
  }
  profile.avatarUrl = "";
  await profile.save();
  return successResponse(res, { statusCode: 200, message: "Avatar deleted successfully", data: { profile } });
});