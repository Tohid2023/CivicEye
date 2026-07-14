const Booking = require("../models/Booking");
const Issue = require("../models/Issue");
const Helper = require("../models/Helper");
const Notification = require("../models/Notification");

// Create booking
const createBooking = async (req, res) => {
  try {
    const { helperId, issueId, address, preferredDate, preferredTime, note } =
      req.body;

    if (!helperId || !issueId || !address || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message:
          "helperId, issueId, address, preferredDate and preferredTime are required",
      });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({
        success: false,
        message: "Helper not found",
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Ensure issue belongs to logged-in user
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only create booking for your own issue",
      });
    }

    // Prevent duplicate active booking for same issue
    const existingActiveBooking = await Booking.findOne({
      user: req.user._id,
      issue: issueId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingActiveBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have an active booking for this issue",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      helper: helperId,
      issue: issueId,
      address,
      preferredDate,
      preferredTime,
      note: note || "",
      status: "pending",
    });

    issue.assignedHelper = helperId;
    issue.status = "booked";

    if (!issue.matchedHelpers.includes(helperId)) {
      issue.matchedHelpers.push(helperId);
    }

    await issue.save();

    // Create notification for Helper
    try {
      const helperNotification = await Notification.create({
        recipient: helperId,
        recipientModel: "Helper",
        sender: req.user._id,
        senderModel: "User",
        booking: booking._id,
        type: "booking",
        title: "New Booking Request",
        message: `You have received a new booking request for "${issue.category}" at "${address}".`,
        isRead: false,
      });

      const io = req.app.get("io");
      if (io) {
        io.to(helperId.toString()).emit("notification", helperNotification);
      }
    } catch (notifError) {
      console.error("Failed to create booking creation notification:", notifError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking",
    });
  }
};

// User: get my bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate(
        "helper",
        "fullName phone category village serviceCharge availability",
      )
      .populate("issue", "category description status address image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
    });
  }
};

// Helper: get assigned bookings
// const Booking = require("../models/Booking");
// const Issue = require("../models/Issue");
// const Helper = require("../models/Helper");

// Helper: get assigned bookings
const getHelperBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ helper: req.user._id })
      .populate("user", "fullName phone village")
      .populate("issue", "category description status address image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Helper Bookings Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching helper bookings",
    });
  }
};

// Helper: accept or reject booking
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["accepted", "rejected", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Helper can only update own booking
    if (booking.helper.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your assigned bookings",
      });
    }

    booking.status = status;
    await booking.save();

    const issue = await Issue.findById(booking.issue);

    if (issue) {
      if (status === "accepted") {
        issue.status = "assigned";
        issue.assignedHelper = booking.helper;

        // Reject all other pending bookings for same issue
        await Booking.updateMany(
          {
            issue: booking.issue,
            _id: { $ne: booking._id },
            status: "pending",
          },
          {
            $set: { status: "rejected" },
          },
        );
      }

      if (status === "rejected") {
        issue.status = "pending";
        issue.assignedHelper = null;
      }

      if (status === "completed") {
        issue.status = "completed";
        issue.assignedHelper = booking.helper;
      }

      if (status === "cancelled") {
        issue.status = "cancelled";
        issue.assignedHelper = null;
      }

      await issue.save();
    }

    // Create notification for User
    try {
      let notifTitle = "";
      let notifMessage = "";
      let notifType = "booking";

      if (status === "accepted") {
        notifTitle = "Booking Accepted";
        notifMessage = `Your booking for "${issue ? issue.category : "service"}" has been accepted by ${req.user.fullName}.`;
      } else if (status === "rejected") {
        notifTitle = "Booking Rejected";
        notifMessage = `Your booking for "${issue ? issue.category : "service"}" has been rejected.`;
      } else if (status === "completed") {
        notifTitle = "Service Completed";
        notifMessage = `Your service booking for "${issue ? issue.category : "service"}" has been marked as completed. Please rate the professional.`;
        notifType = "completed";
      } else if (status === "cancelled") {
        notifTitle = "Booking Cancelled";
        notifMessage = `Your booking for "${issue ? issue.category : "service"}" has been cancelled.`;
      }

      if (notifTitle) {
        const citizenNotification = await Notification.create({
          recipient: booking.user,
          recipientModel: "User",
          sender: req.user._id,
          senderModel: "Helper",
          booking: booking._id,
          type: notifType,
          title: notifTitle,
          message: notifMessage,
          isRead: false,
        });

        const io = req.app.get("io");
        if (io) {
          io.to(booking.user.toString()).emit("notification", citizenNotification);
        }
      }
    } catch (notifError) {
      console.error("Failed to create booking status update notification:", notifError.message);
    }

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating booking status",
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user", "fullName phone village")
      .populate(
        "helper",
        "fullName phone category village serviceCharge availability",
      )
      .populate("issue", "category description status address");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get Booking By ID Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching booking",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getHelperBookings,
  updateBookingStatus,
  getBookingById,
};
