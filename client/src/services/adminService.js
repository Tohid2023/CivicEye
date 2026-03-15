import api from "./api";

export const registerAdmin = async (formData) => {
  const response = await api.post("/admin/register", formData);
  return response.data;
};

export const loginAdmin = async (formData) => {
  const response = await api.post("/admin/login", formData);
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};