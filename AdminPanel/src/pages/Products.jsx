import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";
import ProductModal from "../components/ProductModal";

export default function Products() {
  const { storeId } = useParams();
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const url = storeId
        ? `/catalog/stores/${storeId}/products`
        : `/catalog/products`; // fetch all if no storeId
      const res = await api.get(url);
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
      setProducts(
        products.map((p) => (p.id === id ? { ...p, available: !current } : p))
      );
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {storeId ? `Products for Store ${storeId}` : "All Products"}
        </h1>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
        >
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
              <p className="text-gray-700 mb-2">Price: ₹{p.price}</p>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-white text-sm font-medium ${
                    p.available ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  {p.available ? "Available" : "Unavailable"}
                </span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={p.available}
                    onChange={() => toggleAvailability(p.id, p.available)}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 relative transition-all">
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out ${
                        p.available ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></span>
                  </div>
                </label>
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full"
                onClick={() => {
                  setEditingProduct(p);
                  setModalOpen(true);
                }}
              >
                Edit Product
              </button>
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
