import { useState, useEffect } from "react";
import api from "../api/api";

const ProductModal = ({ product, storeId, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price || "");
      setImage(product.image || "");
      setAvailable(product.available ?? true);
    } else {
      setName("");
      setPrice("");
      setImage("");
      setAvailable(true);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        // Update existing product
        await api.put(`/catalog/products/${product.id}`, {
          name,
          price,
          image,
          available,
          store_id: storeId,
        });
      } else {
        // Add new product
        await api.post("/catalog/products", {
          name,
          price,
          image,
          available,
          store_id: storeId,
        });
      }
      onSave();
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.detail || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-96 p-6 shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Price (₹)</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Image URL</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          {/* Availability toggle */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-700">Available:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={available}
                onChange={() => setAvailable(!available)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
              <span className="ml-2 text-sm text-gray-700">
                {available ? "Yes" : "No"}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {loading ? "Saving..." : product ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
