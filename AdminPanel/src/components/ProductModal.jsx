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
        await api.put(`/catalog/products/${product.id}`, {
          name,
          price,
          image,
          available,
          store_id: storeId,
        });
      } else {
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
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white rounded-2xl w-96 p-6 shadow-2xl relative border border-gray-700">
        <h2 className="text-2xl font-bold mb-5 text-center">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Name</label>
            <input
              type="text"
              className="w-full bg-[#1e293b] text-white border border-gray-600 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Price (₹)</label>
            <input
              type="number"
              className="w-full bg-[#1e293b] text-white border border-gray-600 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Image URL</label>
            <input
              type="text"
              className="w-full bg-[#1e293b] text-white border border-gray-600 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          {/* Availability toggle */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-300">Available:</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={available}
                onChange={() => setAvailable(!available)}
              />
              <div className="w-12 h-6 bg-gray-600 rounded-full peer-checked:bg-green-500 relative transition-all">
                <span
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    available ? "translate-x-6" : ""
                  }`}
                ></span>
              </div>
              <span className="ml-2 text-sm">
                {available ? "Yes" : "No"}
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-70"
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
