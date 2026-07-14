const express = require("express");
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  markChatNotificationsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications for the authenticated user/helper
router.get("/", protect, getNotifications);

// Mark all notifications as read
router.put("/read-all", protect, markAllNotificationsRead);

// Mark chat notifications for a specific booking as read
router.put("/read-chat/:bookingId", protect, markChatNotificationsRead);

// Mark a single notification as read
router.put("/:id/read", protect, markNotificationRead);

// Delete a single notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;
