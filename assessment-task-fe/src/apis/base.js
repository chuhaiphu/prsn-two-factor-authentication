import axios from "axios";
import { refreshTokenApi } from "./user-api";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${JSON.parse(accessToken)}`;
  }
  return config;
});

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = JSON.parse(localStorage.getItem("refresh_token"));
//         const response = await api.post("/auth/refresh", { refreshToken });
//         const { access_token } = response.data.content;
//         localStorage.setItem("access_token", JSON.stringify(access_token));
//         originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         // Redirect to login page or dispatch a logout action
//       }
//     }
//     return Promise.reject(error);
//   }
// );
export default api;