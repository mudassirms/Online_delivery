import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";
import ProductModal from "../components/ProductModal";
import SubcategoryModal from "../components/SubcategoryModal";

export default function StoreProducts() {
  const { storeId } = useParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  // ✅ Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await api.get(`/catalog/stores/${storeId}/products`);
      setProducts(res.data);
    } catch (e) {
      console.warn(e);
    }
  };

  // ✅ Fetch Subcategories
  const fetchSubcategories = async () => {
    try {
      const res = await api.get(`/catalog/stores/${storeId}/subcategories`);
      setSubcategories(res.data);
    } catch (e) {
      console.warn("Failed to load subcategories", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSubcategories();
  }, [storeId]);

  // ✅ Toggle Product Availability
  const toggleAvailability = async (id, current) => {
    try {
      await api.patch(`/catalog/products/${id}`, { available: !current });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, available: !current } : p
        )
      );
    } catch (e) {
      console.warn(e);
    }
  };

  // ✅ Delete Product
  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/catalog/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.warn("Failed to delete product", e);
      alert("Failed to delete product. Try again.");
    }
  };

  return (
    <Layout>
      {/* ✅ HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-md">
          Products — Store #{storeId}
        </h1>

        <div className="flex gap-3">
          {/* ✅ Add Subcategory */}
          <button
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transition"
            onClick={() => setSubcategoryModalOpen(true)}
          >
            + Add Subcategory
          </button>

          {/* ✅ Add Product */}
          <button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transition"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* ✅ PRODUCT LIST */}
      {products.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No products added yet.</p>
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

              {/* ✅ Show Category */}
              <p className="text-sm text-purple-400 mb-1">
                {p.subcategory?.name || "No Category"}
              </p>

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

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={p.available}
                    onChange={() => toggleAvailability(p.id, p.available)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-600 transition-all">
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        p.available ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              {/* ✅ Edit + Delete */}
              <div className="flex justify-between mt-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>

                <button
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg transition"
                  onClick={() => {
                    setEditingProduct(p);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ PRODUCT MODAL */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          storeId={storeId}
          subcategories={subcategories}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            fetchProducts();
          }}
        />
      )}

      {/* ✅ SUBCATEGORY MODAL */}
      {subcategoryModalOpen && (
        <SubcategoryModal
          storeId={storeId}
          onClose={() => setSubcategoryModalOpen(false)}
          onSave={() => {
            setSubcategoryModalOpen(false);
            fetchSubcategories();
          }}
        />
      )}
    </Layout>
  );
}
