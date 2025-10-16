// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://10.48.99.246:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Request interceptor: attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Sending token:', token); // debug log
  } else {
    console.log('No token found');
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Optional: refresh token logic
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { token: refreshToken });
          const newToken = res.data.accessToken;

          await AsyncStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.log('Refresh token failed', refreshError);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('refreshToken');
          // optionally redirect to login screen
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
