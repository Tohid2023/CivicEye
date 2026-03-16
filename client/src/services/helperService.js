import api from "./api";

export const getAllHelpers = async (params = {}) => {
  const response = await api.get("/helpers", { params });
  return response.data;
};

export const getHelperById = async (id) => {
  const response = await api.get(`/helpers/${id}`);
  return response.data;
};

export const getMyHelperProfile = async () => {
  const response = await api.get("/helpers/profile/me");
  return response.data;
};