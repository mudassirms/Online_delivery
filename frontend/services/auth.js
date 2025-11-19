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
  await AsyncStorage.setItem('token', res.data.access_token);

  return res.data;
}

// --- Register ---
export async function register(email, password, name, role, phone) {
  const res = await api.post('/auth/register', {
    email,
    password,
    name,
    role,
    phone,
  });
  return res.data;
}

// --- Logout ---
export async function logout() {
  await AsyncStorage.removeItem('token');
}
export async function getProfile() {
  const res = await api.get('/auth/me');
  return res.data;
}
