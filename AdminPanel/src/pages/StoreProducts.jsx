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

  // Toggle availability
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
      <h1 className="text-2xl font-bold mb-6">Products for Store {storeId}</h1>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => {
          setEditingProduct(null);
          setModalOpen(true);
        }}
      >
        Add Product
      </button>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2 text-center">Available</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">₹{p.price}</td>
              <td className="p-2 text-center">
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
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {p.available ? "Available" : "Unavailable"}
                  </span>
                </label>
              </td>
              <td className="p-2 flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    setEditingProduct(p);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
