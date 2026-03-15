import api from "./api";

export const createIssue = async (formData) => {
  const response = await api.post("/issues/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMyIssues = async () => {
  const response = await api.get("/issues/my-issues");
  return response.data;
};