import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      default: "",
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actor: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      displayName: {
        type: String,
        default: "",
        trim: true,
      },
      photoUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },
    resource: {
      kind: {
        type: String,
        default: "",
        trim: true,
      },
      id: {
        type: String,
        default: "",
        trim: true,
      },
    },
    deeplink: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);

