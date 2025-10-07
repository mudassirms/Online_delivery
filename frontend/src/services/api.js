import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// If testing on a real phone replace with PC's LAN IP e.g. http://192.168.1.50:8000
export const API_BASE = 'http://10.54.10.246:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export default api;
