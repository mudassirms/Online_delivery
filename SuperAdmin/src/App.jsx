import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import UsersPage from "./pages/UsersPage";
import StoresPage from "./pages/StoresPage";
import CategoriesPage from "./pages/CategoriesPage";
import DeliverySettingsPage from "./pages/DeliverySettingsPage";
import OrdersPage from "./pages/OrdersPage";
import SuperadminLogin from "./pages/Login";
import SuperadminRegister from "./pages/Register";

function App() {
  const [token, setToken] = useState(localStorage.getItem("superadmin_token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("superadmin_token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      {token ? (
        <div className="flex min-h-screen">
          <Sidebar setToken={setToken} />
          <div className="flex-1 bg-gray-100">
            <Routes>
              <Route path="/" element={<Navigate to="/users" />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/delivery-settings" element={<DeliverySettingsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/superadmin/login" element={<SuperadminLogin setToken={setToken} />} />
          <Route path="/superadmin/register" element={<SuperadminRegister />} />
          <Route path="*" element={<Navigate to="/superadmin/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
