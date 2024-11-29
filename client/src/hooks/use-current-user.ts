import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { api } from "../lib/api";

/*const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});*/

export const useCurrentUser = () => {
  const {
    isLoading,
    isError,
    data: user,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await api.get("/auth/current-user");
        return response.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  });

  return { isLoading, isError, user };
};
