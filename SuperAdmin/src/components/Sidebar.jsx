import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ setToken }) {
  const navigate = useNavigate();

  const links = [
    { name: "Users", path: "/users" },
    { name: "Stores", path: "/stores" },
    { name: "Categories", path: "/categories" },
    { name: "Delivery Settings", path: "/delivery-settings" },
    { name: "Orders", path: "/orders" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("superadmin_token");
    localStorage.removeItem("superadmin_user");
    setToken(null); // triggers App re-render
    navigate("/superadmin/login");
  };

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">SuperAdmin</h1>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `p-2 rounded hover:bg-gray-700 ${
                isActive ? "bg-gray-700 font-bold" : ""
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 transition font-semibold"
      >
        Logout
      </button>
    </div>
  );
}
