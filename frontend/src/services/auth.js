import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export async function login(email, password) {
  // If backend uses OAuth2 token endpoint (FastAPI's OAuth2PasswordRequestForm),
  // the token endpoint expects "username" + "password" in form format:
  const data = new URLSearchParams();
  data.append('username', email);
  data.append('password', password);
  const res = await api.post('/auth/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  await AsyncStorage.setItem('token', res.data.access_token);
  return res.data;
}

export async function register(email, password) {
  const res = await api.post('/auth/register', { email, password });
  return res.data;
}

export async function logout() {
  await AsyncStorage.removeItem('token');
}
