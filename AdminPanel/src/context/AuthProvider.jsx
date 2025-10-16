import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

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
