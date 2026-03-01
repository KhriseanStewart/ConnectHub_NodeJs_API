import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Profile } from "../models/profiles.js";

export const createProfile = asyncHandler(async (req, res, next) => {
  try {
    const { displayName, bio, location, interests, photoUrls, occupation } = req.body;
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
