import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStores() {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [storesRes, categoriesRes] = await Promise.all([
          api.get("/catalog/stores/my"),
          api.get("/catalog/categories"),
        ]);
        setStores(storesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Failed to load stores:", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, [navigate]);

  const openEditModal = (store) => {
    setCurrentStore({ ...store });
    setEditModalVisible(true);
  };

  const handleSaveStore = async () => {
    if (!currentStore.name || !currentStore.category_id) {
      return alert("Store name and category are required.");
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api.put(
        `/catalog/stores/${currentStore.id}`,
        {
          name: currentStore.name,
          image: currentStore.image,
          contact_number: currentStore.contact_number,
          category_id: currentStore.category_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStores((prev) =>
        prev.map((s) => (s.id === currentStore.id ? res.data : s))
      );
      setEditModalVisible(false);
      alert("Store updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update store");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-20 text-lg text-gray-400 animate-pulse">
          Loading your stores...
        </div>
      </Layout>
    );
  }

  if (stores.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <h2 className="text-xl font-semibold text-gray-200 mb-2">No stores found</h2>
          <p className="text-gray-400">You don’t own any stores yet.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          My Stores
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-gray-700 rounded-2xl p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all group"
            >
              <div
                className="overflow-hidden rounded-xl mb-4 cursor-pointer"
                onClick={() => navigate(`/dashboard/stores/${store.id}`)}
              >
                <img
                  src={store.image || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={store.name}
                  className="w-full h-40 object-cover rounded-xl group-hover:opacity-90 transition-all"
                />
              </div>

              <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-all">
                {store.name}
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                Category ID: <span className="text-gray-300">{store.category_id}</span>
              </p>

              <div className="absolute bottom-3 right-3 flex gap-2">
                <div
                  className="bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full cursor-pointer"
                  onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                >
                  Click to view products →
                </div>

                <button
                  onClick={() => openEditModal(store)}
                  className="bg-orange-500/20 text-orange-400 text-xs px-3 py-1 rounded-full hover:bg-orange-500/40 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Store Modal */}
        {editModalVisible && currentStore && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl w-96 relative">
              <h2 className="text-2xl font-bold mb-4 text-white">Edit Store</h2>

              <input
                type="text"
                placeholder="Store Name"
                value={currentStore.name}
                onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Store Image URL"
                value={currentStore.image || ""}
                onChange={(e) => setCurrentStore({ ...currentStore, image: e.target.value })}
                className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={currentStore.contact_number || ""}
                onChange={(e) => setCurrentStore({ ...currentStore, contact_number: e.target.value })}
                className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={currentStore.category_id || ""}
                onChange={(e) =>
                  setCurrentStore({ ...currentStore, category_id: parseInt(e.target.value) })
                }
                className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditModalVisible(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStore}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StoresPage;
