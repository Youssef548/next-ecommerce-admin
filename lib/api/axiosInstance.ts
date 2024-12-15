import axios from "axios";
import { signOut } from "next-auth/react";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut();

      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
