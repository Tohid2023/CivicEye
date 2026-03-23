import api from "./api";

export const sendOtp = async (formData) => {
  const response = await api.post("/auth/send-otp", formData);
  return response.data;
};

export const verifyOtp = async (formData) => {
  const response = await api.post("/auth/verify-otp", formData);
  return response.data;
};

export const registerUser = async (formData) => {
  const response = await api.post("/auth/register-user", formData);
  return response.data;
};

export const registerHelper = async (formData) => {
  const response = await api.post("/auth/register-helper", formData);
  return response.data;
};

export const loginAccount = async (formData) => {
  const response = await api.post("/auth/login", formData);
  return response.data;
};