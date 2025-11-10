import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Base API URL ---
export const API_BASE = 'http://srv1065687.hstgr.cloud:8029';

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// --- Request Interceptor: Attach access token ---
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error reading token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

        // Refresh access token
        const res = await axios.post(`${API_BASE}/auth/refresh`, { token: refreshToken });
        const newToken = res.data?.access_token;

        if (!newToken) throw new Error('No access token returned from refresh endpoint.');

        // Save new token
        await AsyncStorage.setItem('token', newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('🔁 Token refreshed — retrying request');
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError);
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        // Optionally navigate user to login screen here
      }
    }

    return Promise.reject(error);
  }
);

export default api;
