import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Create Auth Context
export const AuthContext = createContext();

/**
 * AuthProvider wraps the app and provides authentication state and methods.
 */
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null); // JWT or auth token
  const [userInfo, setUserInfo] = useState(null);   // user details
  const [loading, setLoading] = useState(true);     // app loading while fetching user data

  // 🔹 Load token and user info from AsyncStorage on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("user");

        if (token) setUserToken(token);
        if (user) setUserInfo(JSON.parse(user));
      } catch (e) {
        console.error("Failed to load token or user:", e);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 🔹 Login: save token and user info
  const login = async (token, userData) => {
    try {
      await AsyncStorage.setItem("token", token);
      if (userData) {
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUserInfo(userData);
      }
      setUserToken(token);
    } catch (e) {
      console.error("Failed to save login data:", e);
    }
  };

  // 🔹 Logout: clear token and user info
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      setUserToken(null);
      setUserInfo(null);
    } catch (e) {
      console.error("Failed to remove token:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userInfo,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for easier usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
