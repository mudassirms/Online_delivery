import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";
import ProductModal from "../components/ProductModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user info (role, etc.)
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);

      if (res.data.role === "admin") {
        // Fetch admin's stores
        const storesRes = await api.get("/catalog/stores/my");
        setStores(storesRes.data);
        if (storesRes.data.length > 0) setSelectedStore(storesRes.data[0].id);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchProducts = async (storeId) => {
    if (!storeId) return;
    try {
      const res = await api.get(`/catalog/stores/${storeId}/products`);
      setProducts(res.data);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedStore) fetchProducts(selectedStore);
  }, [selectedStore]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await api.delete(`/catalog/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (e) {
      console.warn(e);
    }
  };

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
        <h1 className="text-2xl font-bold">Products</h1>

        {/* Store selector for admin */}
        {currentUser?.role === "admin" && stores.length > 0 && (
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(Number(e.target.value))}
            className="mr-4 p-2 border rounded"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}

        {/* Add Product button */}
        {currentUser?.role === "admin" && selectedStore && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
          >
            Add Product
          </button>
        )}
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Available</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">₹{p.price}</td>
              <td className="p-2">
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={p.available}
                    onChange={() => toggleAvailability(p.id, p.available)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
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
                <button
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Product Modal */}
      {modalOpen && selectedStore && (
        <ProductModal
          product={editingProduct}
          storeId={selectedStore}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            fetchProducts(selectedStore);
          }}
        />
      )}
    </Layout>
  );
}
