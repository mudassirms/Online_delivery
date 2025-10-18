import { NavLink } from "react-router-dom";
import { FaHome, FaBoxOpen, FaList, FaStore, FaSignOutAlt, FaEdit } from "react-icons/fa";

export default function Sidebar({ logout }) {
  const linkClass = ({ isActive }) =>
    `flex items-center p-3 gap-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${
      isActive ? "bg-gray-800 font-semibold" : ""
    }`;

  return (
    <div className="w-64 h-screen bg-gray-900 text-white shadow-lg flex flex-col justify-between">
      {/* Logo / Header */}
      <div>
        <h2 className="text-2xl font-bold text-center py-5 border-b border-gray-700">
          Admin Panel
        </h2>

        {/* Navigation */}
        <nav className="flex flex-col mt-6">
          <NavLink to="/" className={linkClass}>
            <FaHome className="w-5 h-5" /> Dashboard
          </NavLink>
          <NavLink to="/categories" className={linkClass}>
            <FaList className="w-5 h-5" /> Categories
          </NavLink>
          <NavLink to="/stores" className={linkClass}>
            <FaStore className="w-5 h-5" /> Stores
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            <FaBoxOpen className="w-5 h-5" /> Orders
          </NavLink>
          <NavLink to="/store-settings" className={linkClass}>
            <FaEdit className="w-5 h-5" /> Settings
          </NavLink>
          
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="m-4 flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
      >
        <FaSignOutAlt className="w-5 h-5" /> Logout
      </button>
    </div>
  );
}
