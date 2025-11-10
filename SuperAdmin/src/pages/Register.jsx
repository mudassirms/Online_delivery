import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/superadminApi";

export default function SuperadminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Role is fixed to superadmin
      // Include secret key header required by backend
      const response = await api.post(
        "auth/register",
        { name, email, password, phone, role: "superadmin" },
        {
          headers: {
            "superadmin-key": "superadmin_frontend_secret", // match backend secret
          },
        }
      );

      if (response.data?.user) {
        alert("Superadmin account created successfully! You can now log in.");
        navigate("/superadmin/login");
      } else {
        alert("Registration completed, but no user data returned.");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);

      // Show backend message if available
      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else if (err.response?.data) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-900/90 backdrop-blur-md p-10 rounded-3xl shadow-xl w-96 text-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400 text-center drop-shadow-md">
          Superadmin Registration
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full mt-6 py-3 rounded-lg font-semibold text-white ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-600 hover:to-cyan-500 shadow-lg transition-all"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center mt-5 text-sm text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/superadmin/login")}
            className="text-cyan-400 hover:underline cursor-pointer transition"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
