const Notification = require("../models/Notification");

// Get all notifications for the authenticated user/helper
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate({
        path: "booking",
        populate: {
          path: "issue",
          select: "category description status address",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

// Mark a specific notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Ensure recipient is the one marking it read
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied: can only mark your own notifications as read",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating notification",
    });
  }
};

// Mark all notifications for the user as read
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while marking all notifications as read",
    });
  }
};

// Delete a specific notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Ensure recipient is the one deleting it
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied: can only delete your own notifications",
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
    });
  }
};

// Mark all chat notifications for a specific booking as read (real-time chat sync helper)
const markChatNotificationsRead = async (req, res) => {
  try {
    const { bookingId } = req.params;

    await Notification.updateMany(
      {
        recipient: req.user._id,
        booking: bookingId,
        type: "chat",
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Chat notifications for booking marked as read",
    });
  } catch (error) {
    console.error("Mark Chat Notifications Read Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating chat notifications",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  markChatNotificationsRead,
};
