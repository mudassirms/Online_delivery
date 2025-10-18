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
              onClick={() => navigate(`/dashboard/stores/${store.id}`)}
              className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-gray-700 rounded-2xl p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
            >
              <div className="overflow-hidden rounded-xl mb-4">
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

              <div className="absolute bottom-3 right-3 bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full">
                Click to view products →
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default StoresPage;
