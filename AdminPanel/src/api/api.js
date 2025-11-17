import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: "https://api.towndrop.in",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or invalid. Redirecting to login...");
      localStorage.removeItem("admin_token");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;
