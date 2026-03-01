import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    interests: {
      type: [String],
      default: [],
    },
    photoUrls: {
      type: [String],
      default: [],
    },
    occupation: {
      type: [String],
      trim: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ location: 1 });
profileSchema.index({ interests: 1 });

export const Profile = mongoose.model("Profile", profileSchema);
