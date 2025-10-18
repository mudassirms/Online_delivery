// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from AsyncStorage on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) setUserToken(token);
      } catch (e) {
        console.log('Failed to load token', e);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  // Login function: save token and update state
  const login = async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
      setUserToken(token);
    } catch (e) {
      console.log('Failed to save token', e);
    }
  };

  // Logout function: remove token and update state
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUserToken(null);
    } catch (e) {
      console.log('Failed to remove token', e);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
