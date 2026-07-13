const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking ID reference is required"],
    },
    sender: {
      type: String,
      required: [true, "Sender role or name is required"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    text: {
      type: String,
      required: [true, "Message text content is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
