import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStores() {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/catalog/stores/my");
        setStores(res.data);
      } catch (err) {
        console.error("Failed to load stores:", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-10 text-lg">Loading your stores...</div>
      </Layout>
    );
  }

  if (stores.length === 0) {
    return (
      <Layout>
        <div className="text-center mt-10">
          <h2 className="text-lg font-semibold">No stores found</h2>
          <p>You don’t own any stores yet.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Stores</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/dashboard/stores/${store.id}`)}
            >
              <img
                src={store.image || "https://via.placeholder.com/150"}
                alt={store.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold">{store.name}</h2>
              <p className="text-sm text-gray-600">
                Category ID: {store.category_id}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default StoresPage;
