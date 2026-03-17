import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pairKey: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    // Optional: URL to an uploaded image/file (future extension)
    mediaUrl: {
      type: String,
      trim: true,
      default: "",
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ pairKey: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);

