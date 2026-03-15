import api from "./api";

export const createBooking = async (formData) => {
  const response = await api.post("/bookings/create", formData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

export const getHelperBookings = async () => {
  const response = await api.get("/bookings/helper-bookings");
  return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.put(`/bookings/status/${bookingId}`, { status });
  return response.data;
};

export const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};