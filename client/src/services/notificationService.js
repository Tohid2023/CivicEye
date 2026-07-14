import api from "./api";

// Get all notifications for the logged-in user
export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// Mark a single notification as read by ID
export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications for the user as read
export const markAllNotificationsRead = async () => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};

// Mark chat notifications for a specific booking as read
export const markChatNotificationsRead = async (bookingId) => {
  const response = await api.put(`/notifications/read-chat/${bookingId}`);
  return response.data;
};

// Delete a single notification by ID
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
