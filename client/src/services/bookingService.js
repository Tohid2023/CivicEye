import api from "./api";

export const createBooking = async (formData) => {
  const response = await api.post("/bookings/create", formData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};