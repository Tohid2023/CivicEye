const mongoose = require("mongoose");

const helperSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["helper"],
      default: "helper",
    },
    category: {
      type: String,
      enum: ["electrician", "plumber", "road-worker", "cleaner", "technician", "other"],
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    expertise: {
      type: String,
      default: "",
    },
    serviceCharge: {
      type: Number,
      default: 0,
    },
    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Helper", helperSchema);