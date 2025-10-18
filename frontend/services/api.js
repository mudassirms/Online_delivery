// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Base API URL ---
export const API_BASE = 'http://10.48.99.246:8000';

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// --- Request Interceptor ---
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.log('Token attached:', token);
      }
    } catch (error) {
      console.warn('Error reading token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor (Handle 401 & refresh) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.warn('No refresh token found.');
          throw error;
        }

        // Attempt to refresh access token
        const res = await axios.post(`${API_BASE}/auth/refresh`, { token: refreshToken });
        const newToken = res.data?.accessToken;

        if (!newToken) throw new Error('No access token returned from refresh endpoint.');

        await AsyncStorage.setItem('token', newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('🔁 Token refreshed — retrying request');
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError);
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
