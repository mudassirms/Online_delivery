import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export async function login(email, password) {

  const data = new URLSearchParams();
  data.append('username', email);
  data.append('password', password);
  const res = await api.post('/auth/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  await AsyncStorage.setItem('token', res.data.access_token);
  return res.data;
}

export async function register(email, password, name) {
  const res = await api.post('/auth/register', { email, password, name });
  return res.data;
}


export async function logout() {
  await AsyncStorage.removeItem('token');
}
export async function getProfile() {
  const token = await AsyncStorage.getItem('token');
  const res = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}