import api from "./api";

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