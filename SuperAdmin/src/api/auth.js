import api from "./api";

export async function login(email, password) {
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await api.post("/auth/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, user } = res.data;

    // ✅ Store token and user info in localStorage
    localStorage.setItem("admin_token", access_token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return res.data;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err.response?.data || { detail: "Login failed" };
  }
}

export async function register(name, email, password) {
  try {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  } catch (err) {
    console.error("Register error:", err.response?.data || err.message);
    throw err.response?.data || { detail: "Registration failed" };
  }
}

export function logout() {
  try {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect to login page
  } catch (err) {
    console.error("Logout error:", err);
  }
}

export async function getProfile() {
  try {
    const token = localStorage.getItem("admin_token");
    if (!token) throw new Error("No token found");

    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error("Profile fetch error:", err.response?.data || err.message);
    throw err.response?.data || { detail: "Failed to fetch profile" };
  }
}
