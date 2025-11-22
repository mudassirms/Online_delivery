import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Base API URL ---
export const API_BASE = 'http://10.141.151.211:8000';

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true, // 🔥 allow cookies (important for refresh token)
});

// --- Request Interceptor: Attach access token ---
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Auto-refresh token on 401 ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Access token expired — refreshing...");

        // 🔥 Refresh access token (cookie sent automatically)
        const res = await api.post('/auth/refresh');
        const newToken = res.data.access_token;

        // Save new access token
        await AsyncStorage.setItem('token', newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.log("🔴 Refresh token failed — user must log in again.");

        await AsyncStorage.removeItem('token');
        // Option: navigate to login screen
      }
    }

    return Promise.reject(error);
  }
);

export default api;
