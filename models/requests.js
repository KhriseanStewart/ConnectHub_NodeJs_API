import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pairKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled"],
      default: "pending",
      index: true,
    },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ toUser: 1, status: 1, createdAt: -1 });
connectionRequestSchema.index({ fromUser: 1, status: 1, createdAt: -1 });
connectionRequestSchema.index(
  { pairKey: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

const connectionSchema = new mongoose.Schema(
  {
    userA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pairKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

connectionSchema.index({ userA: 1, createdAt: -1 });
connectionSchema.index({ userB: 1, createdAt: -1 });

export const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
export const Connection = mongoose.model("Connection", connectionSchema);