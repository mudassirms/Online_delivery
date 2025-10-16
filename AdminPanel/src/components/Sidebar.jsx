import { NavLink } from "react-router-dom";
import { FaHome, FaBoxOpen, FaList, FaStore, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar({ logout }) {
  const linkClass = ({ isActive }) =>
    `flex items-center p-3 gap-2 rounded hover:bg-gray-200 ${
      isActive ? "bg-gray-200 font-semibold" : ""
    }`;

  return (
    <div className="w-64 h-screen bg-white shadow-lg flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold text-center py-4 border-b">Admin Panel</h2>
        <nav className="flex flex-col mt-4">
          <NavLink to="/" className={linkClass}>
            <FaHome /> Dashboard
          </NavLink>
          <NavLink to="/categories" className={linkClass}>
            <FaList /> Categories
          </NavLink>
          <NavLink to="/stores" className={linkClass}>
            <FaStore /> Stores
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            <FaBoxOpen /> Products
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            <FaBoxOpen /> Orders
          </NavLink>
        </nav>
      </div>

      <button
        onClick={logout}
        className="m-4 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}
