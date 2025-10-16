// src/context/AuthContext.jsx
import  { createContext, useState, useEffect } from "react";

// ✅ Create and export the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) setAdminToken(token);
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("admin_token", token);
    setAdminToken(token);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAdminToken(null);
  };

  return (
    <AuthContext.Provider value={{ adminToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
