import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import StoreSettings from "./pages/StoreSettings";
import Login from "./pages/Login";
import Register from "./pages/Register"; 
import StoreProducts from "./pages/StoreProducts";

function AppRoutes() {
  const { adminToken, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!adminToken) {
    // Logged out routes
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Catch-all redirect to login if unknown route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged in routes
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/products" element={<Products />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/store-settings" element={<StoreSettings />} />
      <Route path="/dashboard/stores/:storeId" element={<StoreProducts />} />
      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
