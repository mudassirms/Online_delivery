import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// --- Login ---
export async function login(email, password) {
  const data = new URLSearchParams();
  data.append('username', email);
  data.append('password', password);

  const res = await api.post('/auth/token', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // Save both access and refresh tokens
  await AsyncStorage.setItem('token', res.data.access_token);
  if (res.data.refresh_token) {
    await AsyncStorage.setItem('refreshToken', res.data.refresh_token);
  }

  return res.data;
}

// --- Register ---
export async function register(email, password, name) {
  const res = await api.post('/auth/register', { email, password, name });
  return res.data;
}

// --- Logout ---
export async function logout() {
  await AsyncStorage.multiRemove(['token', 'refreshToken']);
}

// --- Get Profile ---
export async function getProfile() {
  const res = await api.get('/auth/me'); // token automatically attached by interceptor
  return res.data;
}
