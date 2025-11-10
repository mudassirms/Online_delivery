import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/catalog/categories");
        setCategories(res.data);
      } catch (e) {
        console.warn("Failed to fetch categories:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Categories
        </h1>

        {loading ? (
          <div className="text-center text-gray-400 text-lg mt-10">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-10">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#1e293b] text-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-purple-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">{cat.name}</h2>
                  <span className="text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                    #{cat.id}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  {cat.description || "No description available"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
