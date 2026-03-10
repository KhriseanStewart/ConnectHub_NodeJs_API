import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Profile } from "../models/profiles.js";

export const browseProfiles = asyncHandler(async (req, res, next) => {
    try {
      const { location, interests, occupation } = req.query;
  
      const filter = { user: { $ne: req.user.id } };
  
      if (location) {
        filter.location = location;
      }
  
      if (interests) {
        const interestsArr = Array.isArray(interests)
          ? interests
          : String(interests).split(",").map((s) => s.trim()).filter(Boolean);
  
        filter.interests = { $in: interestsArr };
      }
  
      if (occupation) {
        const occupationArr = Array.isArray(occupation)
          ? occupation
          : String(occupation).split(",").map((s) => s.trim()).filter(Boolean);
  
        filter.occupation = { $in: occupationArr };
      }
  
      const profiles = await Profile.find(filter);
  
      return successResponse(res, {
        statusCode: 200,
        message: "Profiles fetched successfully",
        data: { profiles },
      });
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
