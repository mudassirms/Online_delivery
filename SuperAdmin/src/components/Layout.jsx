import { useContext } from "react";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";

export default function Layout({ children, dark = true }) {
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen">
      <Sidebar logout={logout} />
      <div
        className={`flex-1 p-6 overflow-auto ${
          dark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
