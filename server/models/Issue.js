const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["electricity", "plumbing", "road", "cleaning", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "matched",
        "booked",
        "assigned",
        "in-progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    matchedHelpers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Helper",
      },
    ],
    assignedHelper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Helper",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Issue", issueSchema);
