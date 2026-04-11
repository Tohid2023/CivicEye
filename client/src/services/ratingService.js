import api from "./api";

export const createRating = async (formData) => {
  const response = await api.post("/ratings/create", formData);
  return response.data;
};

export const getHelperRatings = async (helperId) => {
  const response = await api.get(`/ratings/helper/${helperId}`);
  return response.data;
};

export const getMyRatings = async () => {
  const response = await api.get("/ratings/my-ratings");
  return response.data;
};