import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";
import ProductModal from "../components/ProductModal";

export default function StoreProducts() {
  const { storeId } = useParams();
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/catalog/stores/${storeId}/products`);
      setProducts(res.data);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const toggleAvailability = async (id, current) => {
    try {
      await api.patch(`/catalog/products/${id}`, { available: !current });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, available: !current } : p))
      );
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-md">
          Products — Store #{storeId}
        </h1>
        <button
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transition transform"
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">
          No products added yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/60 rounded-2xl p-6 shadow-lg text-gray-200 transition duration-300"
            >
              <h2 className="text-xl font-semibold mb-2 text-cyan-300">
                {p.name}
              </h2>
              <p className="text-gray-400 mb-3 text-sm tracking-wide">
                ₹{p.price.toFixed(2)}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    p.available
                      ? "bg-green-600/80 text-white"
                      : "bg-gray-700/80 text-gray-300"
                  }`}
                >
                  {p.available ? "Available" : "Unavailable"}
                </span>

                {/* Toggle switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={p.available}
                    onChange={() => toggleAvailability(p.id, p.available)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-600 transition-all duration-300 ease-in-out">
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        p.available ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg transition font-medium"
                  onClick={() => {
                    setEditingProduct(p);
                    setModalOpen(true);
                  }}
                >
                  Edit Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          storeId={storeId}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            fetchProducts();
          }}
        />
      )}
    </Layout>
  );
}
