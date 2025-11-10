import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/superadminApi";

export default function SuperadminLogin({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("auth/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, user } = response.data;

      if (user.role !== "superadmin") {
        alert("You are not authorized as a superadmin");
        return;
      }

      // ✅ Store token + user
      localStorage.setItem("superadmin_token", access_token);
      localStorage.setItem("superadmin_user", JSON.stringify(user));

      // ✅ Update token state → triggers re-render in App.jsx
      setToken(access_token);

      // ✅ Redirect to dashboard
      navigate("/users");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      const detail =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail.map((d) => d.msg).join(", ")
          : "Login failed. Please try again.");
      alert(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-900/90 backdrop-blur-md p-10 rounded-3xl shadow-xl w-96 text-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400 text-center drop-shadow-md">
          Superadmin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-600 hover:to-cyan-500 shadow-lg transition-all"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/superadmin/register")}
            className="text-cyan-400 hover:underline cursor-pointer transition"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
