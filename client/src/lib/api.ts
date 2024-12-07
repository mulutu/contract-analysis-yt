import axios from "axios";

export const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const logout = async () => {
  const response = await axiosApi.get("/auth/logout");
  return response.data;
};
