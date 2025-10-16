import { useContext } from "react";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";

export default function Layout({ children }) {
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen">
      <Sidebar logout={logout} />
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</div>
    </div>
  );
}
