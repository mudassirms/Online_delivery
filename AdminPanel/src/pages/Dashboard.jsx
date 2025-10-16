import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    stores: [],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeImage, setStoreImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch dashboard data and categories
useEffect(() => {
  const fetchData = async () => {
    console.log("Fetching dashboard data..."); // <== add this

    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Fetch admin's stores
      const storeRes = await api.get("/catalog/stores/my");
      console.log("Stores:", storeRes.data);

      // Fetch stats if available
      let totalOrders = 0;
      let totalProducts = 0;
      try {
        const statsRes = await api.get("/catalog/stats");
        totalOrders = statsRes?.data?.totalOrders || 0;
        totalProducts = statsRes?.data?.totalProducts || 0;
      } catch {}

      // Fetch categories for creating store
      const categoriesRes = await api.get("/catalog/categories");
      console.log("Categories API Response:", categoriesRes.data);

      setCategories(categoriesRes.data);

      setStats({
        stores: storeRes.data,
        totalOrders,
        totalProducts,
      });
    } catch (e) {
      console.warn("Error fetching dashboard data:", e);
      if (e.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [navigate]);


  const handleAddStore = async () => {
    if (!storeName || !categoryId) {
      alert("Please provide store name and category.");
      return;
    }
    try {
      const res = await api.post("/catalog/stores", {
        name: storeName,
        image: storeImage, // Only URL string
        category_id: parseInt(categoryId),
      });
      setStats((prev) => ({
        ...prev,
        stores: [...prev.stores, res.data],
      }));
      setShowModal(false);
      setStoreName("");
      setStoreImage("");
      setCategoryId("");
      alert("Store added successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add store. Try again.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-10 text-lg">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total Products</h2>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Admin’s Stores */}
      <h2 className="text-xl font-semibold mb-4">Your Stores</h2>
      {stats.stores.length === 0 ? (
        <div className="text-center bg-white p-6 rounded shadow">
          <p className="text-gray-600 mb-4">You don’t have any stores yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.stores.map((store) => (
            <div
              key={store.id}
              className="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/dashboard/stores/${store.id}`)}
            >
              <img
                src={store.image || "https://via.placeholder.com/150"}
                alt={store.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-semibold">{store.name}</h3>
              <p className="text-sm text-gray-500">
                Category ID: {store.category_id}
              </p>
            </div>
          ))}
          <div
            className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded p-6 cursor-pointer hover:bg-gray-100"
            onClick={() => setShowModal(true)}
          >
            <p className="text-gray-600 font-semibold">+ Add Store</p>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-96 relative">
            <h2 className="text-xl font-bold mb-4">Add Store</h2>

            <input
              type="text"
              placeholder="Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="text"
              placeholder="Store Image URL (optional)"
              value={storeImage}
              onChange={(e) => setStoreImage(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStore}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Store
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
