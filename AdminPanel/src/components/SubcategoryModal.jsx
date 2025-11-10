import { useState } from "react";
import api from "../api/api";

export default function SubcategoryModal({ storeId, onClose, onSave }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/catalog/subcategories", {
        name,
        store_id: Number(storeId),
      });

      onSave();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl text-white font-bold mb-4">Add Subcategory</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Subcategory Name</label>
            <input
              type="text"
              className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg mt-1 border border-gray-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {loading ? "Saving..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
