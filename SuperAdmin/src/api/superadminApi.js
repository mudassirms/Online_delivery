import axios from "axios";

const superadminApi = axios.create({
  baseURL: "http://72.60.218.22:8029", // backend prefix
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
superadminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("superadmin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle invalid/expired tokens globally
superadminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Superadmin token expired — redirecting to login...");
      localStorage.removeItem("superadmin_token");
      window.location.href = "/superadmin/login";
    }
    return Promise.reject(error);
  }
);

export const getUsersWithStores = () => superadminApi.get("/superadmin/users-with-stores");
export const getStores = () => superadminApi.get("/superadmin/stores");
export const getCategories = () => superadminApi.get("/superadmin/categories");
export const createCategory = (data) => superadminApi.post("/superadmin/categories", data);
export const updateCategory = (id, data) =>
  superadminApi.put(`/superadmin/categories/${id}`, data);
export const deleteCategory = (id) =>
  superadminApi.delete(`/superadmin/categories/${id}`);
export const getDeliverySettings = () => superadminApi.get("/superadmin/delivery-settings");
export const updateDeliverySettings = (data) =>
  superadminApi.put("/superadmin/delivery-settings", data);
export const getOrders = () => superadminApi.get("/superadmin/orders");
export const patchOrder = (id, data) =>
  superadminApi.patch(`/superadmin/orders/${id}`, data);
export const deleteOrder = (id) => superadminApi.delete(`/superadmin/orders/${id}`);

export default superadminApi;
