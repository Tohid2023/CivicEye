const express = require("express");
const {
  createBooking,
  getMyBookings,
  getHelperBookings,
  updateBookingStatus,
  getBookingById,
} = require("../controllers/bookingController");

const { protect, isUser, isHelper } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/create", protect, isUser, createBooking);
router.get("/my-bookings", protect, isUser, getMyBookings);

// Helper routes
router.get("/helper-bookings", protect, isHelper, getHelperBookings);
router.put("/status/:id", protect, isHelper, updateBookingStatus);

// Shared protected route
router.get("/:id", protect, getBookingById);

module.exports = router;